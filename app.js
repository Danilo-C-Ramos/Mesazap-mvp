const STORAGE_KEY = 'mesazap.orders.v1';
const statuses = ['Novo', 'Preparando', 'Pronto', 'Entregue'];
let orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let filter = 'all';
let activeView = 'front';

const $ = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

function orderMessage(order) {
  return `Pedido #${order.code}\nCliente: ${order.customer}\nTipo: ${order.type}\nItens:\n${order.items}\n\nTotal: ${money(order.total)}\nPagamento: ${order.payment}${order.notes ? `\nObs: ${order.notes}` : ''}\nStatus: ${order.status}`;
}

function getVisibleOrders() {
  return orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function renderStats() {
  $('openCount').textContent = orders.filter(o => o.status !== 'Entregue').length;
  $('kitchenCount').textContent = orders.filter(o => ['Novo', 'Preparando'].includes(o.status)).length;
  $('todayTotal').textContent = money(orders.reduce((sum, o) => sum + Number(o.total || 0), 0));
}

function fillCommonTicket(node, order) {
  node.querySelector('.order, .kitchen-ticket').dataset.id = order.id;
  node.querySelector('.customer').textContent = `${order.customer} · #${order.code}`;
  node.querySelector('.meta').textContent = `${order.type} • ${new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${order.payment}`;
  const badge = node.querySelector('.badge');
  badge.textContent = order.status;
  badge.className = `badge ${order.status}`;
  node.querySelector('.items').textContent = order.items;
  node.querySelector('.notes').textContent = order.notes || 'Sem observações.';
}

function renderFront() {
  const container = $('orders');
  container.innerHTML = '';
  const visible = getVisibleOrders();
  if (!visible.length) {
    container.innerHTML = '<p class="subtitle">Nenhum pedido nesse filtro ainda.</p>';
  }
  for (const order of visible) {
    const node = $('orderTemplate').content.cloneNode(true);
    fillCommonTicket(node, order);
    node.querySelector('.total').textContent = money(order.total);
    container.appendChild(node);
  }
}

function renderKitchenColumn(containerId, status, emptyText) {
  const container = $(containerId);
  container.innerHTML = '';
  const list = orders.filter(o => o.status === status).sort((a, b) => a.createdAt - b.createdAt);
  if (!list.length) {
    container.innerHTML = `<p class="subtitle empty">${emptyText}</p>`;
  }
  for (const order of list) {
    const node = $('kitchenTemplate').content.cloneNode(true);
    fillCommonTicket(node, order);
    node.querySelector('[data-action="prepare"]').hidden = order.status !== 'Novo';
    node.querySelector('[data-action="ready"]').hidden = order.status === 'Pronto';
    node.querySelector('[data-action="delivered"]').hidden = order.status !== 'Pronto';
    container.appendChild(node);
  }
}

function renderKitchen() {
  renderKitchenColumn('newKitchenOrders', 'Novo', 'Sem pedidos novos.');
  renderKitchenColumn('preparingKitchenOrders', 'Preparando', 'Nada em preparo.');
  renderKitchenColumn('readyKitchenOrders', 'Pronto', 'Nada pronto aguardando entrega.');
}

function render() {
  renderStats();
  renderFront();
  renderKitchen();
}

function setView(view) {
  activeView = view;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
  $('frontView').classList.toggle('active', view === 'front');
  $('kitchenView').classList.toggle('active', view === 'kitchen');
}

$('orderForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const nextNumber = (orders.reduce((max, order) => Math.max(max, Number(order.code || 0)), 0) + 1).toString().padStart(3, '0');
  const order = {
    id: crypto.randomUUID(),
    code: nextNumber,
    customer: $('customer').value.trim(),
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
  setView('kitchen');
  render();
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.classList.contains('tab')) {
    setView(button.dataset.view);
    return;
  }

  if (button.classList.contains('filter')) {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    filter = button.dataset.filter;
    render();
    return;
  }

  if (button.id === 'clearDelivered' && confirm('Remover pedidos entregues da lista?')) {
    orders = orders.filter(o => o.status !== 'Entregue');
    save();
    render();
    return;
  }

  const card = button.closest('.order, .kitchen-ticket');
  if (!card) return;
  const order = orders.find(o => o.id === card.dataset.id);
  if (!order) return;

  const action = button.dataset.action;
  if (action === 'next') {
    const index = statuses.indexOf(order.status);
    order.status = statuses[Math.min(index + 1, statuses.length - 1)];
    save(); render();
  }
  if (action === 'prepare') {
    order.status = 'Preparando';
    save(); render();
  }
  if (action === 'ready') {
    order.status = 'Pronto';
    save(); render();
  }
  if (action === 'delivered') {
    order.status = 'Entregue';
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
});

render();
