import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Tab = 'home' | 'employees' | 'departments' | 'positions'

interface Department {
  departmentId: number
  departmentName: string
}

interface Position {
  positionId: number
  positionName: string
}

interface Employee {
  id: number
  employeeNo: string
  employeeName: string
  gender: string
  departmentId: number
  departmentName: string
  positionId: number
  positionName: string
  mobile: string
  phone: string
  email: string
  fax: string
  picture: string
}

interface EmployeeForm {
  employeeNo: string
  employeeName: string
  gender: string
  departmentId: string
  positionId: string
  mobile: string
  phone: string
  email: string
  fax: string
  picture: string
}

const emptyEmployee: EmployeeForm = {
  employeeNo: '',
  employeeName: '',
  gender: 'Male',
  departmentId: '',
  positionId: '',
  mobile: '',
  phone: '',
  email: '',
  fax: '',
  picture: ''
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployee)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null)

  const [departmentName, setDepartmentName] = useState('')
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null)

  const [positionName, setPositionName] = useState('')
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)

  const setInfo = (text: string) => {
    setError('')
    setMessage(text)
  }

  const setFailure = (text: string) => {
    setMessage('')
    setError(text)
  }

  const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, options)
    if (!response.ok) {
      const body = await response.text()
      throw new Error(body || `Request failed (${response.status})`)
    }
    return (await response.json()) as T
  }

  const deleteRequest = async (url: string) => {
    const response = await fetch(url, { method: 'DELETE' })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(body || `Delete failed (${response.status})`)
    }
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [depData, posData, empData] = await Promise.all([
        fetchJson<Department[]>('/api/departments'),
        fetchJson<Position[]>('/api/positions'),
        fetchJson<Employee[]>('/api/employees')
      ])
      setDepartments(depData)
      setPositions(posData)
      setEmployees(empData)
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  useEffect(() => {
    setImagePreviewFailed(false)
  }, [employeeForm.picture])

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees
    const term = search.toLowerCase().trim()
    return employees.filter((e) =>
      `${e.employeeNo} ${e.employeeName} ${e.email} ${e.mobile} ${e.phone}`.toLowerCase().includes(term)
    )
  }, [employees, search])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim()) {
      setFailure('Username is required.')
      return
    }

    try {
      const result = await fetchJson<{ token: string; displayName: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      setDisplayName(result.displayName)
      setPassword('')
      setInfo(`Welcome ${result.displayName}.`)
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const submitDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!departmentName.trim()) return

    try {
      const url = editingDepartmentId ? `/api/departments/${editingDepartmentId}` : '/api/departments'
      const method = editingDepartmentId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentName })
      })
      setDepartmentName('')
      setEditingDepartmentId(null)
      await loadAll()
      setInfo('Department saved successfully.')
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Department save failed')
    }
  }

  const deleteDepartment = async (id: number) => {
    try {
      await deleteRequest(`/api/departments/${id}`)
      await loadAll()
      setInfo('Department deleted.')
    } catch {
      setFailure('Could not delete department.')
    }
  }

  const submitPosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!positionName.trim()) return

    try {
      const url = editingPositionId ? `/api/positions/${editingPositionId}` : '/api/positions'
      const method = editingPositionId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionName })
      })
      setPositionName('')
      setEditingPositionId(null)
      await loadAll()
      setInfo('Position saved successfully.')
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Position save failed')
    }
  }

  const deletePosition = async (id: number) => {
    try {
      await deleteRequest(`/api/positions/${id}`)
      await loadAll()
      setInfo('Position deleted.')
    } catch {
      setFailure('Could not delete position.')
    }
  }

  const submitEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!employeeForm.employeeNo.trim() || !employeeForm.employeeName.trim()) {
      setFailure('Employee No and Employee Name are required.')
      return
    }

    const payload = {
      ...employeeForm,
      departmentId: Number(employeeForm.departmentId),
      positionId: Number(employeeForm.positionId)
    }

    try {
      const url = editingEmployeeId ? `/api/employees/${editingEmployeeId}` : '/api/employees'
      const method = editingEmployeeId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      setEmployeeForm(emptyEmployee)
      setEditingEmployeeId(null)
      await loadAll()
      setInfo('Employee saved successfully.')
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Employee save failed')
    }
  }

  const deleteEmployee = async (id: number) => {
    try {
      await deleteRequest(`/api/employees/${id}`)
      await loadAll()
      setInfo('Employee deleted.')
    } catch {
      setFailure('Could not delete employee.')
    }
  }

  const fillImageFromApi = async () => {
    if (!employeeForm.employeeNo.trim()) {
      setFailure('Enter Employee No first.')
      return
    }

    try {
      const result = await fetchJson<{ imageUrl: string; message?: string }>(
        `/api/employees/image-url/${encodeURIComponent(employeeForm.employeeNo)}`
      )
      if (result.imageUrl) {
        setEmployeeForm((prev) => ({ ...prev, picture: result.imageUrl }))
        setInfo('Image URL retrieved from external API.')
      } else {
        setFailure(result.message || 'No image URL returned by external API.')
      }
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Could not retrieve image URL')
    }
  }

  return (
    <div className="abc-app">
      <header className="topbar">
        <div>
          <p className="brand">ABC Company</p>
          <h1>Employee Directory Platform</h1>
        </div>

        <form className="login" onSubmit={submitLogin}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (optional)"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
          {displayName ? <span className="hello">Hi, {displayName}</span> : null}
        </form>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</button>
        <button className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}>Employee</button>
        <button className={activeTab === 'departments' ? 'active' : ''} onClick={() => setActiveTab('departments')}>Department</button>
        <button className={activeTab === 'positions' ? 'active' : ''} onClick={() => setActiveTab('positions')}>Position</button>
      </nav>

      {message ? <p className="info">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="loading">Loading data...</p> : null}

      {activeTab === 'home' && (
        <section className="home-grid">
          <article>
            <h2>Employees</h2>
            <p className="metric">{employees.length}</p>
            <p>Total employee records in the system.</p>
          </article>
          <article>
            <h2>Departments</h2>
            <p className="metric">{departments.length}</p>
            <p>Maintain departments used in employee profiles.</p>
          </article>
          <article>
            <h2>Positions</h2>
            <p className="metric">{positions.length}</p>
            <p>Maintain official designation and title list.</p>
          </article>
        </section>
      )}

      {activeTab === 'employees' && (
        <section className="two-col">
          <form className="card" onSubmit={submitEmployee}>
            <h2>{editingEmployeeId ? 'Update Employee' : 'Add Employee'}</h2>

            <div className="employee-editor">
              <div className="grid-two">
                <label>Employee No<input value={employeeForm.employeeNo} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeNo: e.target.value })} required /></label>
                <label>Employee Name<input value={employeeForm.employeeName} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeName: e.target.value })} required /></label>
                <label>Gender<select value={employeeForm.gender} onChange={(e) => setEmployeeForm({ ...employeeForm, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label>Department<select value={employeeForm.departmentId} onChange={(e) => setEmployeeForm({ ...employeeForm, departmentId: e.target.value })} required><option value="">Select department</option>{departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}</select></label>
                <label>Position<select value={employeeForm.positionId} onChange={(e) => setEmployeeForm({ ...employeeForm, positionId: e.target.value })} required><option value="">Select position</option>{positions.map((p) => <option key={p.positionId} value={p.positionId}>{p.positionName}</option>)}</select></label>
                <label>Mobile<input value={employeeForm.mobile} onChange={(e) => setEmployeeForm({ ...employeeForm, mobile: e.target.value })} /></label>
                <label>Phone<input value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} /></label>
                <label>Email<input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} /></label>
                <label>Fax<input value={employeeForm.fax} onChange={(e) => setEmployeeForm({ ...employeeForm, fax: e.target.value })} /></label>
                <label>Picture URL<input value={employeeForm.picture} onChange={(e) => setEmployeeForm({ ...employeeForm, picture: e.target.value })} /></label>
              </div>

              <aside className="image-aside" aria-live="polite">
                <h3>Image Preview</h3>
                {employeeForm.picture.trim() && !imagePreviewFailed ? (
                  <img
                    className="image-preview"
                    src={employeeForm.picture.trim()}
                    alt={`${employeeForm.employeeName || employeeForm.employeeNo || 'Employee'} preview`}
                    onError={() => setImagePreviewFailed(true)}
                  />
                ) : (
                  <div className="image-placeholder">
                    {employeeForm.picture.trim() ? 'Image could not be loaded.' : 'Enter or retrieve a Picture URL.'}
                  </div>
                )}
                <p className="image-caption">{employeeForm.picture.trim() || 'No image URL selected.'}</p>
              </aside>
            </div>

            <div className="actions">
              <button type="button" className="alt" onClick={fillImageFromApi}>Retrieve Image URL</button>
              <button type="submit">{editingEmployeeId ? 'Update' : 'Add'}</button>
              {editingEmployeeId ? <button type="button" className="alt" onClick={() => { setEditingEmployeeId(null); setEmployeeForm(emptyEmployee) }}>Cancel</button> : null}
            </div>
          </form>

          <div className="card">
            <h2>Employee List</h2>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee" />
            <ul className="list">
              {filteredEmployees.map((e) => (
                <li key={e.id}>
                  <div>
                    <strong>{e.employeeNo} - {e.employeeName}</strong>
                    <p>{e.departmentName} | {e.positionName}</p>
                    <p>{e.mobile} | {e.phone} | {e.email}</p>
                  </div>
                  <div className="actions compact">
                    <button className="alt" onClick={() => {
                      setEditingEmployeeId(e.id)
                      setEmployeeForm({
                        employeeNo: e.employeeNo,
                        employeeName: e.employeeName,
                        gender: e.gender,
                        departmentId: String(e.departmentId),
                        positionId: String(e.positionId),
                        mobile: e.mobile,
                        phone: e.phone,
                        email: e.email,
                        fax: e.fax,
                        picture: e.picture
                      })
                      setActiveTab('employees')
                    }}>Edit</button>
                    <button className="danger" onClick={() => deleteEmployee(e.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'departments' && (
        <section className="card single">
          <h2>Department Maintenance</h2>
          <form onSubmit={submitDepartment} className="inline-form">
            <input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Department Name" required />
            <button type="submit">{editingDepartmentId ? 'Update' : 'Add'}</button>
            {editingDepartmentId ? <button type="button" className="alt" onClick={() => { setEditingDepartmentId(null); setDepartmentName('') }}>Cancel</button> : null}
          </form>
          <ul className="list">
            {departments.map((d) => (
              <li key={d.departmentId}>
                <div><strong>{d.departmentId}</strong> - {d.departmentName}</div>
                <div className="actions compact">
                  <button className="alt" onClick={() => { setEditingDepartmentId(d.departmentId); setDepartmentName(d.departmentName) }}>Edit</button>
                  <button className="danger" onClick={() => deleteDepartment(d.departmentId)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'positions' && (
        <section className="card single">
          <h2>Position Maintenance</h2>
          <form onSubmit={submitPosition} className="inline-form">
            <input value={positionName} onChange={(e) => setPositionName(e.target.value)} placeholder="Position Name" required />
            <button type="submit">{editingPositionId ? 'Update' : 'Add'}</button>
            {editingPositionId ? <button type="button" className="alt" onClick={() => { setEditingPositionId(null); setPositionName('') }}>Cancel</button> : null}
          </form>
          <ul className="list">
            {positions.map((p) => (
              <li key={p.positionId}>
                <div><strong>{p.positionId}</strong> - {p.positionName}</div>
                <div className="actions compact">
                  <button className="alt" onClick={() => { setEditingPositionId(p.positionId); setPositionName(p.positionName) }}>Edit</button>
                  <button className="danger" onClick={() => deletePosition(p.positionId)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default App
