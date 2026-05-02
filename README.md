# MesaZap — MVP de pedidos para restaurante

MVP simples para restaurante que hoje anota pedidos no WhatsApp.

## O que faz

- Cadastro rápido de pedido: cliente/mesa, WhatsApp, tipo, itens, total, pagamento e observações.
- Kanban/lista com status: Novo → Preparando → Pronto → Entregue.
- Copiar resumo do pedido.
- Abrir WhatsApp com mensagem pronta para o cliente.
- Salva os pedidos no navegador via `localStorage`.

## Como rodar localmente

Abra `index.html` no navegador.

Ou, para servir localmente:

```bash
python3 -m http.server 8080
```

Depois acesse: `http://localhost:8080`

## Limitações do MVP

- Dados ficam só no navegador usado.
- Não tem login, impressão, multi-atendente ou banco online.
- Não integra automaticamente com WhatsApp Business API.

## Próximo passo para virar produto real

1. Publicar frontend.
2. Adicionar backend e banco: Supabase/Firebase.
3. Login por restaurante.
4. Cardápio cadastrado com preços.
5. Tela de cozinha separada.
6. Integração oficial WhatsApp Business API ou fluxo semi-automático.
