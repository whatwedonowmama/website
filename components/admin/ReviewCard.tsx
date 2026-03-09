'use client'
import { useState } from 'react'
import type { PendingContent } from '@/lib/types'

interface Props {
  item: PendingContent
  onDone: (id: string) => void
}

const SOURCE_EMOJI: Record<string, string> = {
  'Eventbrite': '🎟️',
  'OC Parks':   '🌿',
  'Irvine':     '🏙️',
}

export default function ReviewCard({ item, onDone }: Props) {
  const [editing, setEditing]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fields, setFields]     = useState({
    title:         item.title,
    description:   item.description ?? '',
    event_date:    item.event_date ?? '',
    event_time:    item.event_time ?? '',
    location_name: item.location_name ?? '',
    city:          item.city ?? '',
    price:         item.price ?? '',
    is_free:       item.is_free,
    category:      item.category ?? '',
    source_url:    item.source_url ?? '',
  })

  async function act(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch('/api/admin/review', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: item.id, action, updates: fields }),
    })
    setLoading(false)
    onDone(item.id)
  }

  async function saveEdit() {
    setLoading(true)
    await fetch('/api/admin/review', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: item.id, action: 'edit', updates: fields }),
    })
    setLoading(false)
    setEditing(false)
  }

  const isEvent    = item.content_type === 'event'
  const sourceIcon = SOURCE_EMOJI[item.source_name ?? ''] ?? '🔗'

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Top bar: type + source ── */}
      <div className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${
        isEvent ? 'bg-brand-coral/10 text-brand-coral' : 'bg-brand-lavender text-brand-purple'
      }`}>
        <span>{isEvent ? '📅 Event' : '📖 Resource'}</span>
        {item.source_name && (
          <span className="text-gray-500 font-normal">{sourceIcon} {item.source_name}</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {editing ? (
          /* ── EDIT FORM ── */
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Title</span>
              <input
                className="input-field text-sm"
                value={fields.title}
                onChange={e => setFields(f => ({ ...f, title: e.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Description</span>
              <textarea
                rows={3}
                className="input-field text-sm resize-none"
                value={fields.description}
                onChange={e => setFields(f => ({ ...f, description: e.target.value }))}
              />
            </label>

            {isEvent && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">Date</span>
                  <input
                    type="date"
                    className="input-field text-sm"
                    value={fields.event_date}
                    onChange={e => setFields(f => ({ ...f, event_date: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">Time</span>
                  <input
                    className="input-field text-sm"
                    value={fields.event_time}
                    onChange={e => setFields(f => ({ ...f, event_time: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">Location</span>
                  <input
                    className="input-field text-sm"
                    value={fields.location_name}
                    onChange={e => setFields(f => ({ ...f, location_name: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">City</span>
                  <input
                    className="input-field text-sm"
                    value={fields.city}
                    onChange={e => setFields(f => ({ ...f, city: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 col-span-2">
                  <span className="text-xs font-medium text-gray-500">Price</span>
                  <div className="flex items-center gap-3">
                    <input
                      className="input-field text-sm flex-1"
                      value={fields.price}
                      onChange={e => setFields(f => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. $5 per person or Free"
                    />
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={fields.is_free}
                        onChange={e => setFields(f => ({ ...f, is_free: e.target.checked }))}
                      />
                      Free
                    </label>
                  </div>
                </label>
              </div>
            )}

            {!isEvent && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Category</span>
                <select
                  className="input-field text-sm"
                  value={fields.category}
                  onChange={e => setFields(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">Select…</option>
                  <option value="sleep">Sleep</option>
                  <option value="feeding">Feeding</option>
                  <option value="development">Development</option>
                  <option value="activities">Activities</option>
                  <option value="milestones">Milestones</option>
                  <option value="oc-guides">OC Guides</option>
                </select>
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Source URL</span>
              <input
                className="input-field text-sm"
                value={fields.source_url}
                onChange={e => setFields(f => ({ ...f, source_url: e.target.value }))}
              />
            </label>

            {/* Edit actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdit}
                disabled={loading}
                className="flex-1 btn-primary text-sm py-2 justify-center"
              >
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 text-sm py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── READ VIEW ── */
          <>
            <div>
              <h3 className="font-display font-bold text-brand-navy text-lg leading-snug">
                {fields.title}
              </h3>
              {fields.description && (
                <p className="text-gray-600 text-sm mt-1.5 leading-relaxed line-clamp-3">
                  {fields.description}
                </p>
              )}
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              {isEvent && fields.event_date && (
                <span className="bg-brand-cream border border-brand-gold/30 text-brand-navy px-2.5 py-1 rounded-full">
                  📅 {fields.event_date}
                </span>
              )}
              {isEvent && fields.event_time && (
                <span className="bg-brand-cream border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                  🕙 {fields.event_time}
                </span>
              )}
              {isEvent && (fields.location_name || fields.city) && (
                <span className="bg-brand-cream border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                  📍 {[fields.location_name, fields.city].filter(Boolean).join(', ')}
                </span>
              )}
              {isEvent && (
                <span className={`px-2.5 py-1 rounded-full font-medium ${
                  fields.is_free
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-brand-cream border border-gray-200 text-gray-600'
                }`}>
                  {fields.is_free ? '✓ Free' : fields.price || 'Paid'}
                </span>
              )}
              {!isEvent && fields.category && (
                <span className="bg-brand-lavender text-brand-purple px-2.5 py-1 rounded-full capitalize">
                  {fields.category.replace('-', ' ')}
                </span>
              )}
              {fields.source_url && (
                <a
                  href={fields.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 border border-gray-200 text-brand-purple px-2.5 py-1 rounded-full hover:underline"
                >
                  View source ↗
                </a>
              )}
            </div>
          </>
        )}

        {/* ── Action buttons (only in read mode) ── */}
        {!editing && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => act('approve')}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? '…' : '✅ Approve'}
            </button>
            <button
              onClick={() => setEditing(true)}
              disabled={loading}
              className="flex-1 bg-brand-lavender hover:bg-brand-lavender/80 text-brand-purple font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => act('reject')}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              ❌ Skip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
