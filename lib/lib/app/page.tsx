'use client';

import { useState } from 'react';
import { normalizeInstagramUsername, formatTL } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface OrderItem {
  id: string;
  product_code: string;
  title: string;
  price_cents: number;
}

export default function LiveSalePage() {
  const [username, setUsername] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [productCode, setProductCode] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const handleFindOrCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    const cleanUsername = normalizeInstagramUsername(username);

    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('instagram_username', cleanUsername)
      .single();

    if (!customer) {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({ instagram_username: cleanUsername })
        .select()
        .single();

      if (error) {
        alert('Müşteri kaydı açılamadı. Lütfen veritabanı bağlantısını kontrol edin.');
        setLoading(false);
        return;
      }
      customer = newCustomer;
    }

    let { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'cart')
      .single();

    if (!order) {
      const { data: newOrder } = await supabase
        .from('orders')
        .insert({ customer_id: customer.id, status: 'cart' })
        .select()
        .single();
      order = newOrder;
    }

    if (order) {
      setOrderId(order.id);
      setPublicToken(order.public_token);
      fetchItems(order.id);
    }

    setLoading(false);
  };

  const fetchItems = async (currentOrderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', currentOrderId)
      .order('created_at', { ascending: true });

    if (data) setItems(data);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !productCode || !price) return;

    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

    const { data: newItem, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        product_code: productCode.trim().toUpperCase(),
        title: title.trim() || 'Canlı Yayın Ürünü',
        price_cents: priceCents,
      })
      .select()
      .single();

    if (!error && newItem) {
      setItems([...items, newItem]);
      setProductCode('');
      setTitle('');
      setPrice('');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const totalCents = items.reduce((acc, item) => acc + item.price_cents, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#FAF9F6] min-h-screen text-gray-800">
      <header className="mb-8 border-b border-[#D4A373] pb-4">
        <h1 className="text-3xl font-serif text-[#8C5E3C]">ATÖLYE AYANE</h1>
        <p className="text-sm text-gray-500">Canlı Satış Yönetim Paneli</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleFindOrCreateCustomer} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Instagram Kullanıcı Adı
            </label>
            <input
              type="text"
              placeholder="@kullanici_adi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#8C5E3C] text-white font-medium rounded-md hover:bg-[#6F472D]"
          >
            {loading ? 'Bekleyin...' : 'Müşteri Sepetini Aç'}
          </button>
        </form>
      </div>

      {orderId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-[#8C5E3C] mb-4">Ürün Ekle</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ürün Kodu *</label>
                <input
                  type="text"
                  placeholder="Örn: VNT-101"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Nostaljik Ahşap Kutu"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fiyat (TL) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#D4A373] text-white font-semibold rounded-md hover:bg-[#C29263]"
              >
                Sepete Ekle
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#8C5E3C] mb-4">
                Sepet: @{normalizeInstagramUsername(username)}
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Henüz ürün eklenmedi.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded text-sm">
                      <div>
                        <span className="font-bold text-[#8C5E3C] mr-2">[{item.product_code}]</span>
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatTL(item.price_cents)}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-xs font-bold"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <span className="font-bold">Toplam:</span>
              <span className="text-xl font-bold text-[#8C5E3C]">{formatTL(totalCents)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
