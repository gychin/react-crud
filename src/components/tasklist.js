import React, { useEffect, useState, useCallback } from 'react';
import { Constants } from '../utils/constants';

export default function TaskList() {

  const [tasks, setTasks] = useState([]);
  const [tasksWithoutFilter, setTasksWithoutFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalTitle, setModalTitle] = useState('');
  const [Title, setTitle] = useState('');
  const [Description, setDescription] = useState('');
  const [Status, setStatus] = useState('');
  const [TaskId, setTaskId] = useState(0);
  const [DueDate, setDueDate] = useState('');
  const [ParentId, setParentId] = useState('');
  const [Priority, setPriority] = useState('');
  const [Assignee, setAssignee] = useState('');

  const [TaskIdFilter, setTaskIdFilter] = useState('');
  const [TitleFilter, setTitleFilter] = useState('');
  const [DescriptionFilter, setDescriptionFilter] = useState('');
  const [StatusFilter, setStatusFilter] = useState('');
  const [DueDateFilter, setDueDateFilter] = useState('');
  const [ParentIdFilter, setParentIdFilter] = useState('');
  const [PriorityFilter, setPriorityFilter] = useState('');
  const [AssigneeFilter, setAssigneeFilter] = useState('');

  const apiBase = (Constants && Constants.API_URL) ? Constants.API_URL : '';

  const refreshList = useCallback(() => {
    setLoading(true);
    fetch(apiBase + 'ToDoItems')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
          setTasksWithoutFilter(data);
        } else {
          setTasks([]);
          setTasksWithoutFilter([]);
        }
      })
      .catch(() => {
        setTasks([]);
        setTasksWithoutFilter([]);
      })
      .finally(() => setLoading(false));
  }, [apiBase]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const FilterFn = () => {
    const tId = TaskIdFilter.toString().trim().toLowerCase();
    const tTitle = TitleFilter.toString().trim().toLowerCase();
    const tDescription = DescriptionFilter.toString().trim().toLowerCase();
    const tStatus = StatusFilter.toString().trim().toLowerCase();
    const tDueDate = DueDateFilter.toString().trim().toLowerCase();
    const tParentId = ParentIdFilter.toString().trim().toLowerCase();
    const tPriority = PriorityFilter.toString().trim().toLowerCase();
    const tAssignee = AssigneeFilter.toString().trim().toLowerCase();

    const filtered = tasksWithoutFilter.filter((el) => {
      const idStr = (el.TaskId ?? el.id ?? '').toString().toLowerCase();
      const nameStr = (el.Title ?? el.title ?? '').toString().toLowerCase();
      const descriptionStr = (el.Description ?? el.description ?? '').toString().toLowerCase();
      const statusStr = (el.Status ?? el.status ?? '').toString().toLowerCase();
      const dueDateStr = (el.DueDate ?? el.dueDate ?? '').toString().toLowerCase();
      const parentIdStr = (el.ParentId ?? el.parentId ?? '').toString().toLowerCase();
      const priorityStr = (el.Priority ?? el.priority ?? '').toString().toLowerCase();
      const assigneeStr = (el.Assignee ?? el.assignee ?? '').toString().toLowerCase();
      return idStr.includes(tId) && nameStr.includes(tTitle) && descriptionStr.includes(tDescription) && statusStr.includes(tStatus) && dueDateStr.includes(tDueDate) && parentIdStr.includes(tParentId) && priorityStr.includes(tPriority) && assigneeStr.includes(tAssignee);
    });
    setTasks(filtered);
  };

  const sortResult = (prop, asc) => {
    const resolve = (item, key) => {
      switch (key) {
        case 'TaskId': return item.TaskId ?? item.id ?? '';
        case 'Title': return item.Title ?? item.title ?? '';
        case 'Description': return item.Description ?? item.description ?? '';
        case 'Status': return item.Status ?? item.status ?? '';
        case 'DueDate': return item.DueDate ?? item.dueDate ?? '';
        case 'ParentId': return item.ParentId ?? item.parentId ?? '';
        case 'Priority': return item.Priority ?? item.priority ?? '';
        case 'Assignee': return item.Assignee ?? item.assignee ?? '';
        default: return item[key] ?? '';
      }
    };

    const compare = (a, b) => {
      const va = resolve(a, prop);
      const vb = resolve(b, prop);
      // numeric compare for id-like fields
      if (prop === 'TaskId' || prop === 'ParentId' || prop === 'Priority') {
        const na = Number(va);
        const nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
      }
      const A = (va ?? '').toString().toLowerCase();
      const B = (vb ?? '').toString().toLowerCase();
      if (A > B) return asc ? 1 : -1;
      if (A < B) return asc ? -1 : 1;
      return 0;
    };

    // Sort the currently visible tasks (so sorting respects any active filters)
    const sortedVisible = [...tasks].sort(compare);
    setTasks(sortedVisible);
  };

  // Robust parser: support numeric timestamps, MS JSON "/Date(123)/", ISO strings,
  // and fallback attempts. Returns a Date or null.
  const parseToDate = (value) => {
    if (!value && value !== 0) return null;
    if (value instanceof Date) return value;
    // number (ms since epoch)
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      // MS JSON: /Date(1234567890)/
      const msJson = value.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
      if (msJson) return new Date(parseInt(msJson[1], 10));

      // ISO with explicit timezone (Z or ±HH:MM) -> let Date parse
      if (/[T ].*Z$|[T ].*[+-]\d{2}:?\d{2}$/.test(value)) {
        const dtz = new Date(value);
        if (!isNaN(dtz)) return dtz;
      }

      // Local ISO-like without timezone: YYYY-MM-DD or YYYY-MM-DDTHH:MM(:SS)
      let m = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (m) {
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), parseInt(m[4], 10), parseInt(m[5], 10), parseInt(m[6] || '0', 10));
      }
      m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
      }

      // digits-only (epoch seconds or ms)
      if (/^\d+$/.test(value)) {
        const v = parseInt(value, 10);
        return new Date(v.toString().length >= 12 ? v : v * 1000);
      }

      // Fallback: let Date try to parse (may interpret as UTC or local depending on format)
      const d = new Date(value);
      if (!isNaN(d)) return d;
    }
    return null;
  };


  const changeTaskIdFilter = (e) => {
    setTaskIdFilter(e.target.value);
  };

  const changeTitleFilter = (e) => {
    setTitleFilter(e.target.value);
  };

  const changeDescriptionFilter = (e) => {
    setDescriptionFilter(e.target.value);
  };
  const changeStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };
  const changeDueDateFilter = (e) => {
    setDueDateFilter(e.target.value);
  };
  const changeParentIdFilter = (e) => {
    setParentIdFilter(e.target.value);
  };

  const changePriorityFilter = (e) => {
    setPriorityFilter(e.target.value);
  };

  const changeAssigneeFilter = (e) => {
    setAssigneeFilter(e.target.value);
  };

  useEffect(() => {
    FilterFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TaskIdFilter, TitleFilter, DescriptionFilter, StatusFilter, DueDateFilter, ParentIdFilter, PriorityFilter, AssigneeFilter]);
  const addClick = () => {
    setModalTitle('Add Task');
    setTaskId(0);
    setTitle('');
    setDescription('');
    setStatus('');
    setDueDate('');
    setParentId('');
    setPriority('');
    setAssignee('');
  };

  const editClick = (task) => {
    setModalTitle('Edit Task');
    setTaskId(task.TaskId ?? task.id ?? 0);
    setTitle(task.Title ?? task.title ?? '');
    setDescription(task.Description ?? task.description ?? '');
    setStatus(task.Status ?? task.status ?? '');
    // Normalize due date to a `datetime-local` value (YYYY-MM-DDTHH:MM)
    const rawDue = task.DueDate ?? task.dueDate ?? '';
    if (rawDue) {
      const d = parseToDate(formatDateToLocal(rawDue).toString());
      if (d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setDueDate(`${y}-${m}-${day}T${hh}:${mm}`);
      } else {
        setDueDate('');
      }
    } else {
      setDueDate('');
    }
    setParentId(task.ParentId ?? task.parentId ?? '');
    setPriority(task.Priority ?? task.priority ?? '');
    setAssignee(task.Assignee ?? task.assignee ?? '');
  };

  const createClick = () => {
    const parsedDue = DueDate ? new Date(Date.parse(DueDate)).toISOString() : null;
    var newItemValues = { id: TaskId, parentId: parseInt(ParentId) || 0, title: Title, description: Description, dueDate: parsedDue, status: Status, priority: parseInt(Priority) || 0, assignee: Assignee, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    fetch(apiBase + 'ToDoItems', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItemValues),
    })
      .then((res) => res.json())
      .then((result) => {
        refreshList();
        try { document.querySelector('#exampleModal .btn-close')?.click(); } catch (e) {}
      })
      .catch(() => alert('Failed'));
  };

  const updateClick = () => {
    const parsedDue = DueDate ? new Date(Date.parse(DueDate)).toISOString() : null;
    var updateItemValues = { id: TaskId, parentId: parseInt(ParentId) || 0, title: Title, description: Description, dueDate: parsedDue, status: Status, priority: parseInt(Priority) || 0, assignee: Assignee, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    fetch(apiBase + 'ToDoItems/' + TaskId, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateItemValues),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Update failed');
        }
        refreshList();
        try { document.querySelector('#exampleModal .btn-close')?.click(); } catch (e) {}
      })
      .catch(() => alert('Failed'));
  };

  const deleteClick = (id) => {
    if (!window.confirm('Are you sure?')) return;
    fetch(apiBase + 'ToDoItems/' + id, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Delete failed');
        }
        refreshList();
      })
      .catch(() => alert('Failed'));
  };

  const changeTitle = (e) => setTitle(e.target.value);
   const changeDescription = (e) => setDescription(e.target.value);

  const formatDateToLocal = (dateString) => {
    const offset = new Date(dateString).getTimezoneOffset();
    const local = new Date(new Date(dateString).getTime() - (offset * 60 * 1000));
    return local.toLocaleString();
}
  return (
    <div>
      <button
        type="button"
        className="btn btn-primary m-2 float-end"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
        onClick={addClick}
      >
        Add Task
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>
              <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={TaskIdFilter}
                  onChange={changeTaskIdFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('TaskId', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('TaskId', false)}>
                  ↓
                </button>
              </div>
              Task Id
            </th>
            <th>
              <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={TitleFilter}
                  onChange={changeTitleFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('Title', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('Title', false)}>
                  ↓
                </button>
              </div>
              Title
            </th>
             <th>              
              <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={DescriptionFilter}
                  onChange={changeDescriptionFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('Description', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('Description', false)}>
                  ↓
                </button>
              </div>
              Description
              </th>
              <th>
                <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={StatusFilter}
                  onChange={changeStatusFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('Status', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('Status', false)}>
                  ↓
                </button>
              </div>
              Status</th>
              <th>
                <div className="d-flex flex-row">
                <input
                  type="date"
                  className="form-control m-2"
                  value={DueDateFilter}
                  onChange={changeDueDateFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('DueDate', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('DueDate', false)}>
                  ↓
                </button>
              </div>
              Due Date
              </th>
              <th>
                <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={ParentIdFilter}
                  onChange={changeParentIdFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('ParentId', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('ParentId', false)}>
                  ↓
                </button>
              </div>
                Parent Id
                </th>
                <th>
                <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={PriorityFilter}
                  onChange={changePriorityFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('Priority', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('Priority', false)}>
                  ↓
                </button>
              </div>
                Priority
                </th>
                  <th>
                <div className="d-flex flex-row">
                <input
                  className="form-control m-2"
                  value={AssigneeFilter}
                  onChange={changeAssigneeFilter}
                  placeholder="Filter"
                />
                <button type="button" className="btn btn-light" onClick={() => sortResult('Assignee', true)}>
                  ↑
                </button>
                <button type="button" className="btn btn-light" onClick={() => sortResult('Assignee', false)}>
                  ↓
                </button>
              </div>
                Assignee
                </th>
              <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={3}>Loading...</td></tr>
          ) : tasks.length === 0 ? (
            <tr><td colSpan={3}>No tasks found.</td></tr>
          ) : (
            tasks.map((task) => {
              const dueRaw = task.DueDate ?? task.dueDate ?? '';
              let dueDisplay = '';
              let isPast = false;
              if (dueRaw) {
                const parsed = parseToDate(dueRaw);
                if (parsed) {
                  // display localized date & time
                  //dueDisplay = parsed.toLocaleString();
                  dueDisplay = formatDateToLocal(dueRaw);
                  console.log('DueDate local formatted:', dueDisplay);
                  // compare full datetime against now (local)
                  isPast = parsed.getTime() < Date.now();
                }
              }

              return (
                <tr key={task.TaskId ?? task.id}>
                  <td>{task.TaskId ?? task.id}</td>
                  <td>{task.Title ?? task.title}</td>
                  <td>{task.Description ?? task.description}</td>
                  <td>{task.Status ?? task.status}</td>
                  <td className={isPast ? 'text-danger' : ''}>{dueDisplay}</td>
                  <td>{task.ParentId ?? task.parentId}</td>
                  <td>{task.Priority ?? task.priority}</td>
                  <td>{task.Assignee ?? task.assignee}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-light mr-1"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      onClick={() => editClick(task)}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-light mr-1" onClick={() => deleteClick(task.TaskId ?? task.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="modal fade" id="exampleModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="input-group mb-3">
                <span className="input-group-text">Title</span>
                <input type="text" className="form-control" value={Title} onChange={changeTitle} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Description</span>
                <input type="text" className="form-control" value={Description} onChange={changeDescription} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Status</span>
                <input type="text" className="form-control" value={Status} onChange={(e) => setStatus(e.target.value)} />
              </div>
             <div className="input-group mb-3">
                <span className="input-group-text">Due Date</span>
                <input type="datetime-local" className="form-control" value={DueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
                            <div className="input-group mb-3">
                <span className="input-group-text">Parent Id</span>
                <input type="text" className="form-control" value={ParentId} onChange={(e) => setParentId(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Priority</span>
                <input type="text" className="form-control" value={Priority} onChange={(e) => setPriority(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Assignee</span>
                <input type="text" className="form-control" value={Assignee} onChange={(e) => setAssignee(e.target.value)} />
              </div>
              {TaskId === 0 ? (
                <button type="button" className="btn btn-primary float-start" onClick={createClick}>Create</button>
              ) : (
                <button type="button" className="btn btn-primary float-start" onClick={updateClick}>Update</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}