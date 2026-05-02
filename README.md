# MesaZap — MVP de pedidos para restaurante

MVP simples para restaurante que hoje anota pedidos manualmente e precisa organizar atendimento + cozinha.

## O que faz

- Atendimento cadastra pedidos por cliente/mesa, tipo, itens, total, pagamento e observações.
- Cardápio clicável de bebidas/drinks com preços; o total é calculado automaticamente.
- Campo de WhatsApp removido da tela de registro para acelerar o lançamento.
- Tela **Cozinha** com fila separada:
  - Novos
  - Preparando
  - Prontos
- Cozinha consegue avançar o pedido: `Começar preparo` → `Marcar pronto` → `Entregue`.
- Atendimento acompanha status: `Novo → Preparando → Pronto → Entregue`.
- Copiar resumo do pedido.
- Salva os pedidos no navegador via `localStorage`.

## Como acessar publicado

GitHub Pages:

https://danilo-c-ramos.github.io/Mesazap-mvp/

## Como rodar localmente

Abra `index.html` no navegador.

Ou, para servir localmente:

```bash
python3 -m http.server 8080
```

Depois acesse: `http://localhost:8080`

## Limitações do MVP

- Dados ficam só no navegador usado.
- A tela da cozinha funciona no mesmo navegador/dispositivo nesta versão.
- Para atendimento e cozinha usarem dispositivos diferentes, precisa backend/banco online.
- Não tem login, impressão, multi-atendente ou integração oficial WhatsApp Business API.

## Próximo passo para virar produto real

1. Adicionar backend e banco: Supabase/Firebase.
2. Sincronizar atendimento e cozinha em tempo real.
3. Login por restaurante.
4. Cardápio cadastrado com preços.
5. Impressão ou painel dedicado de cozinha.
6. Histórico e relatório de vendas.
