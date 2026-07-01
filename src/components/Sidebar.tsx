import { useState } from 'react'
import type { Department } from '../types'

interface Props {
  departments: Department[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddDepartment: (name: string) => void
  onRenameDepartment: (id: string, name: string) => void
  onDeleteDepartment: (id: string) => void
  fiscalYear: number
  onChangeFiscalYear: (year: number) => void
}

export default function Sidebar({
  departments,
  selectedId,
  onSelect,
  onAddDepartment,
  onRenameDepartment,
  onDeleteDepartment,
  fiscalYear,
  onChangeFiscalYear,
}: Props) {
  const [newDept, setNewDept] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <aside className="sidebar">
      <div className="fiscal-year-picker">
        <label htmlFor="fiscal-year">対象年度</label>
        <select
          id="fiscal-year"
          value={fiscalYear}
          onChange={(e) => onChangeFiscalYear(Number(e.target.value))}
        >
          {Array.from({ length: 7 }, (_, i) => fiscalYear - 3 + i).map((y) => (
            <option key={y} value={y}>
              {y}年度
            </option>
          ))}
        </select>
      </div>

      <h2>部門一覧</h2>
      <ul className="department-list">
        {departments.map((dept) => (
          <li key={dept.id} className={dept.id === selectedId ? 'selected' : ''}>
            {editingId === dept.id ? (
              <input
                autoFocus
                defaultValue={dept.name}
                onBlur={(e) => {
                  onRenameDepartment(dept.id, e.target.value.trim() || dept.name)
                  setEditingId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
              />
            ) : (
              <button type="button" className="dept-button" onClick={() => onSelect(dept.id)}>
                {dept.name}
              </button>
            )}
            <div className="dept-actions">
              <button type="button" className="icon-btn" title="名前を変更" onClick={() => setEditingId(dept.id)}>
                ✎
              </button>
              <button
                type="button"
                className="icon-btn danger"
                title="削除"
                onClick={() => {
                  if (confirm(`「${dept.name}」を削除しますか？`)) onDeleteDepartment(dept.id)
                }}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="add-department-form"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = newDept.trim()
          if (!trimmed) return
          onAddDepartment(trimmed)
          setNewDept('')
        }}
      >
        <input
          placeholder="新しい部門名"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
        />
        <button type="submit">部門を追加</button>
      </form>
    </aside>
  )
}
