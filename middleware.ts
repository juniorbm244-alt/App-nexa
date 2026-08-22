export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/patrimonio/:path*", "/financeiro/:path*", "/documentos/:path*", "/calendario/:path*", "/ai/:path*", "/notificacoes/:path*", "/assinatura/:path*"],
};
