import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import BudgetTable from './components/BudgetTable'
import SummaryDashboard from './components/SummaryDashboard'
import FxDashboard from './components/fx/FxDashboard'
import { createDepartment, createLineItem, loadData, saveData } from './storage'
import type { BudgetData } from './types'

type Tab = 'table' | 'summary' | 'fx'

function App() {
  const [data, setData] = useState<BudgetData>(() => loadData())
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(
    () => data.departments[0]?.id ?? null,
  )
  const [tab, setTab] = useState<Tab>('table')

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    if (!selectedDeptId && data.departments.length > 0) {
      setSelectedDeptId(data.departments[0].id)
    }
  }, [data.departments, selectedDeptId])

  const selectedDept = data.departments.find((d) => d.id === selectedDeptId) ?? null

  function updateDepartments(fn: (departments: BudgetData['departments']) => BudgetData['departments']) {
    setData((prev) => ({ ...prev, departments: fn(prev.departments) }))
  }

  function handleAddDepartment(name: string) {
    const dept = createDepartment(name)
    updateDepartments((depts) => [...depts, dept])
    setSelectedDeptId(dept.id)
  }

  function handleRenameDepartment(id: string, name: string) {
    updateDepartments((depts) => depts.map((d) => (d.id === id ? { ...d, name } : d)))
  }

  function handleDeleteDepartment(id: string) {
    updateDepartments((depts) => depts.filter((d) => d.id !== id))
    if (selectedDeptId === id) {
      const remaining = data.departments.filter((d) => d.id !== id)
      setSelectedDeptId(remaining[0]?.id ?? null)
    }
  }

  function handleAddCategory(name: string) {
    if (!selectedDept) return
    updateDepartments((depts) =>
      depts.map((d) => (d.id === selectedDept.id ? { ...d, items: [...d.items, createLineItem(name)] } : d)),
    )
  }

  function handleRenameCategory(itemId: string, name: string) {
    if (!selectedDept) return
    updateDepartments((depts) =>
      depts.map((d) =>
        d.id === selectedDept.id
          ? { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, category: name } : i)) }
          : d,
      ),
    )
  }

  function handleDeleteCategory(itemId: string) {
    if (!selectedDept) return
    updateDepartments((depts) =>
      depts.map((d) => (d.id === selectedDept.id ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d)),
    )
  }

  function handleChangeValue(itemId: string, monthIndex: number, mode: 'budget' | 'actual', value: number) {
    if (!selectedDept) return
    updateDepartments((depts) =>
      depts.map((d) => {
        if (d.id !== selectedDept.id) return d
        return {
          ...d,
          items: d.items.map((i) => {
            if (i.id !== itemId) return i
            const next = { ...i, [mode]: [...i[mode]] }
            next[mode][monthIndex] = value
            return next
          }),
        }
      }),
    )
  }

  function handleChangeFiscalYear(year: number) {
    setData((prev) => ({ ...prev, fiscalYear: year }))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>部門予算管理表</h1>
        <nav className="tab-nav">
          <button type="button" className={tab === 'table' ? 'active' : ''} onClick={() => setTab('table')}>
            部門別入力
          </button>
          <button type="button" className={tab === 'summary' ? 'active' : ''} onClick={() => setTab('summary')}>
            全体サマリー
          </button>
          <button type="button" className={tab === 'fx' ? 'active' : ''} onClick={() => setTab('fx')}>
            為替影響
          </button>
        </nav>
      </header>

      <div className="app-body">
        <Sidebar
          departments={data.departments}
          selectedId={selectedDeptId}
          onSelect={(id) => {
            setSelectedDeptId(id)
            setTab('table')
          }}
          onAddDepartment={handleAddDepartment}
          onRenameDepartment={handleRenameDepartment}
          onDeleteDepartment={handleDeleteDepartment}
          fiscalYear={data.fiscalYear}
          onChangeFiscalYear={handleChangeFiscalYear}
        />

        <main className="app-main">
          {tab === 'fx' ? (
            <FxDashboard fiscalYear={data.fiscalYear} />
          ) : tab === 'summary' ? (
            <SummaryDashboard departments={data.departments} fiscalYear={data.fiscalYear} />
          ) : selectedDept ? (
            <BudgetTable
              department={selectedDept}
              fiscalYear={data.fiscalYear}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onChangeValue={handleChangeValue}
            />
          ) : (
            <p className="empty-state">部門を追加してください。</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
