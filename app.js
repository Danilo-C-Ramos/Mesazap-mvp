const STORAGE_KEY = 'mesazap.orders.v1';
const statuses = ['Novo', 'Preparando', 'Pronto', 'Entregue'];
let orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let filter = 'all';

const $ = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

function orderMessage(order) {
  return `Olá! Pedido registrado ✅\n\nCliente: ${order.customer}\nTipo: ${order.type}\nItens:\n${order.items}\n\nTotal: ${money(order.total)}\nPagamento: ${order.payment}${order.notes ? `\nObs: ${order.notes}` : ''}\n\nStatus: ${order.status}`;
}

function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function render() {
  const container = $('orders');
  container.innerHTML = '';
  const visible = orders.filter(o => filter === 'all' || o.status === filter).sort((a,b) => b.createdAt - a.createdAt);
  if (!visible.length) {
    container.innerHTML = '<p class="subtitle">Nenhum pedido nesse filtro ainda.</p>';
  }
  for (const order of visible) {
    const node = $('orderTemplate').content.cloneNode(true);
    node.querySelector('.order').dataset.id = order.id;
    node.querySelector('.customer').textContent = order.customer;
    node.querySelector('.meta').textContent = `${order.type} • ${new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${order.payment}`;
    const badge = node.querySelector('.badge');
    badge.textContent = order.status;
    badge.classList.add(order.status);
    node.querySelector('.items').textContent = order.items;
    node.querySelector('.notes').textContent = order.notes || 'Sem observações.';
    node.querySelector('.total').textContent = money(order.total);
    container.appendChild(node);
  }
  $('openCount').textContent = orders.filter(o => o.status !== 'Entregue').length;
  $('todayTotal').textContent = money(orders.reduce((sum, o) => sum + Number(o.total || 0), 0));
}

$('orderForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const order = {
    id: crypto.randomUUID(),
    customer: $('customer').value.trim(),
    phone: $('phone').value.trim(),
    type: $('type').value,
    items: $('items').value.trim(),
    total: $('total').value || 0,
    payment: $('payment').value,
    notes: $('notes').value.trim(),
    status: 'Novo',
    createdAt: Date.now(),
  };
  orders.push(order);
  save();
  event.target.reset();
  render();
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.classList.contains('filter')) {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    filter = button.dataset.filter;
    render();
    return;
  }

  const card = button.closest('.order');
  if (!card) return;
  const order = orders.find(o => o.id === card.dataset.id);
  if (!order) return;

  const action = button.dataset.action;
  if (action === 'next') {
    const index = statuses.indexOf(order.status);
    order.status = statuses[Math.min(index + 1, statuses.length - 1)];
    save(); render();
  }
  if (action === 'delete' && confirm('Excluir este pedido?')) {
    orders = orders.filter(o => o.id !== order.id);
    save(); render();
  }
  if (action === 'copy') {
    await navigator.clipboard.writeText(orderMessage(order));
    button.textContent = 'Copiado!';
    setTimeout(() => button.textContent = 'Copiar', 1200);
  }
  if (action === 'whatsapp') {
    const phone = normalizePhone(order.phone);
    const text = encodeURIComponent(orderMessage(order));
    window.open(phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
  }
});

render();
