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

  const [TaskIdFilter, setTaskIdFilter] = useState('');
  const [TitleFilter, setTitleFilter] = useState('');
  const [DescriptionFilter, setDescriptionFilter] = useState('');
  const [StatusFilter, setStatusFilter] = useState('');
  const [DueDateFilter, setDueDateFilter] = useState('');
  const [ParentIdFilter, setParentIdFilter] = useState('');

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

    const filtered = tasksWithoutFilter.filter((el) => {
      const idStr = (el.TaskId ?? el.id ?? '').toString().toLowerCase();
      const nameStr = (el.Title ?? el.title ?? '').toString().toLowerCase();
      const descriptionStr = (el.Description ?? el.description ?? '').toString().toLowerCase();
      const statusStr = (el.Status ?? el.status ?? '').toString().toLowerCase();
      const dueDateStr = (el.DueDate ?? el.dueDate ?? '').toString().toLowerCase();
      const parentIdStr = (el.ParentId ?? el.parentId ?? '').toString().toLowerCase();
      return idStr.includes(tId) && nameStr.includes(tTitle) && descriptionStr.includes(tDescription) && statusStr.includes(tStatus) && dueDateStr.includes(tDueDate) && parentIdStr.includes(tParentId);
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
        default: return item[key] ?? '';
      }
    };

    const compare = (a, b) => {
      const va = resolve(a, prop);
      const vb = resolve(b, prop);
      // numeric compare for id-like fields
      if (prop === 'TaskId' || prop === 'ParentId') {
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
  useEffect(() => {
    FilterFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TaskIdFilter, TitleFilter, DescriptionFilter, StatusFilter, DueDateFilter, ParentIdFilter]);

  const addClick = () => {
    setModalTitle('Add Task');
    setTaskId(0);
    setTitle('');
    setDescription('');
    setStatus('');
    setDueDate('');
    setParentId('');
  };

  const editClick = (task) => {
    setModalTitle('Edit Task');
    setTaskId(task.TaskId ?? task.id ?? 0);
    setTitle(task.Title ?? task.title ?? '');
    setDescription(task.Description ?? task.description ?? '');
    setStatus(task.Status ?? task.status ?? '');
    // Normalize due date to YYYY-MM-DD so the date input shows the value
    const rawDue = task.DueDate ?? task.dueDate ?? '';
    if (rawDue) {
      const d = new Date(rawDue);
      if (!isNaN(d)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setDueDate(`${y}-${m}-${day}`);
      } else {
        setDueDate('');
      }
    } else {
      setDueDate('');
    }
    setParentId(task.ParentId ?? task.parentId ?? '');
  };

  const createClick = () => {
    const parsedDue = DueDate ? new Date(Date.parse(DueDate)).toISOString() : null;
    var newItemValues = { id: TaskId, parentId: parseInt(ParentId) || 0, title: Title, description: Description, dueDate: parsedDue, status: Status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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
    var updateItemValues = { id: TaskId, parentId: parseInt(ParentId) || 0, title: Title, description: Description, dueDate: parsedDue, status: Status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

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
              const dueDisplay = dueRaw ? dueRaw.toString().slice(0, 10) : '';
              let isPast = false;
              if (dueRaw) {
                const parsed = new Date(dueRaw);
                if (!isNaN(parsed)) {
                  const today = new Date();
                  const parsedDateOnly = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
                  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  isPast = parsedDateOnly < todayDateOnly;
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
                <input type="date" className="form-control" value={DueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Parent Id</span>
                <input type="text" className="form-control" value={ParentId} onChange={(e) => setParentId(e.target.value)} />
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