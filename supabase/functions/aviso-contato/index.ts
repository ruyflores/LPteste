// Avanttá: e-mail de aviso a cada contato novo do site.
// Chamada pelo Database Webhook da tabela "leads" (evento INSERT).
// Segredos (Edge Functions > Secrets): RESEND_API_KEY, AVISO_PARA, AVISO_DE, WEBHOOK_SEGREDO.

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  // só aceita chamadas do próprio webhook (cabeçalho x-segredo configurado no webhook)
  if (req.headers.get("x-segredo") !== Deno.env.get("WEBHOOK_SEGREDO")) {
    return new Response("não autorizado", { status: 401 });
  }
  const { record: r } = await req.json();
  if (!r) return new Response("sem dados", { status: 400 });

  const completo = r.etapa === "completo";
  const assunto = completo
    ? `Contato completo: ${r.nome} (${r.empresa}) | ${r.investimento}`
    : `Novo contato no site: ${r.nome} (${r.empresa})`;
  const whats = String(r.whatsapp ?? "").replace(/\D/g, "");
  const linhas: [string, unknown][] = [
    ["Nome", r.nome], ["Empresa", r.empresa], ["WhatsApp", r.whatsapp], ["E-mail", r.email],
    ["Investimento", r.investimento], ["Para quando", r.urgencia], ["Precisa de", r.servico],
    ["Site ou Instagram", r.link], ["Caminho", r.rota === "agenda" ? "foi para a agenda" : r.rota === "whatsapp" ? "foi para o WhatsApp" : ""],
    ["Origem", [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ")],
  ];
  const html = `
    <h2 style="font-family:sans-serif">${esc(assunto)}</h2>
    <table style="font-family:sans-serif;font-size:14px">${linhas
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td><b>${esc(v)}</b></td></tr>`)
      .join("")}</table>
    ${whats ? `<p><a href="https://wa.me/55${whats}">Chamar no WhatsApp</a></p>` : ""}
    ${completo ? "" : "<p style='color:#666'>A pessoa ainda está preenchendo o resto do formulário.</p>"}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("AVISO_DE") ?? "Site Avanttá <onboarding@resend.dev>",
      to: [Deno.env.get("AVISO_PARA")],
      subject: assunto,
      html,
      reply_to: r.email || undefined,
    }),
  });
  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
