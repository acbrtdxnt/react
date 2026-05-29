import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const apiUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME || 'React App';
const STORAGE_KEY = 'localUsers';

export const loadLocalUsers = () => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const validate = (values) => {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\+?[0-9\s-]{7,20}$/.test(values.phone)) {
    errors.phone = 'Enter a valid phone number.';
  }

  return errors;
};

const initialForm = {
  name: '',
  email: '',
  phone: '',
};

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [apiUsers, setApiUsers] = useState([]);
  const [localUsers, setLocalUsers] = useState(loadLocalUsers);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Save local users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUsers));
  }, [localUsers]);

  const handleFetchUsers = async () => {
    setIsFetchingUsers(true);
    setFetchError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const users = await response.json();
      setApiUsers(users);
    } catch (error) {
      setFetchError(`Failed to fetch users: ${error.message}`);
      setApiUsers([]);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate(formData);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setFormMessage({ type: 'danger', text: 'Please fix the highlighted errors.' });
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      
      // Create a new local user with the form data
      const newUser = {
        id: `local_${Date.now()}`, // Unique local ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isLocal: true,
        apiResponseId: result.id,
      };

      // Add to local users
      setLocalUsers((prev) => [newUser, ...prev]);

      setFormMessage({
        type: 'success',
        text: `User "${formData.name}" added successfully! (Local ID: ${newUser.id}, API Response ID: ${result.id})`,
      });
      setFormData(initialForm);
    } catch (error) {
      setFormMessage({
        type: 'danger',
        text: `Failed to add user: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocalUser = (userId) => {
    setLocalUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  // Merge API users and local users
  const allUsers = [...localUsers, ...apiUsers];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12">
          {/* Header with Fetch Button */}
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h1>{appName}</h1>
            <button
              className="btn btn-success"
              onClick={handleFetchUsers}
              disabled={isFetchingUsers}
            >
              {isFetchingUsers ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Fetching...
                </>
              ) : (
                'Fetch Users from API'
              )}
            </button>
          </div>

          {/* API Status */}
          {fetchError && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {fetchError}
              <button
                type="button"
                className="btn-close"
                onClick={() => setFetchError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {apiUsers.length > 0 && (
            <div className="alert alert-info">
              ✓ Successfully fetched <strong>{apiUsers.length} users</strong> from JSONPlaceholder API
            </div>
          )}

          {/* Add User Form */}
          <div className="card shadow-sm mb-5">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">Add New User</h5>
              <p className="text-muted small">Form submission is sent via HTTPS POST to the API and stored locally.</p>

              {formMessage && (
                <div className={`alert alert-${formMessage.type} mt-3`} role="alert">
                  {formMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Jane Doe"
                    disabled={isSubmitting}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="jane@example.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="+1 555-555-5555"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding User...' : 'Add User'}
                </button>
              </form>
            </div>
          </div>

          {/* All Users Display */}
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                All Users ({allUsers.length})
                {localUsers.length > 0 && (
                  <span className="badge bg-warning text-dark ms-2">{localUsers.length} local</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {allUsers.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No users to display. <br />
                  <small>Click "Fetch Users from API" above or add a new user using the form.</small>
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Source</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className={user.isLocal ? 'table-warning' : ''}>
                          <td>{user.name}</td>
                          <td>
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                          </td>
                          <td>{user.phone}</td>
                          <td>
                            {user.isLocal ? (
                              <span className="badge bg-warning text-dark">Local</span>
                            ) : (
                              <span className="badge bg-info">API</span>
                            )}
                          </td>
                          <td>
                            {user.isLocal && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteLocalUser(user.id)}
                                title="Delete local user"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-light rounded text-muted small">
            <strong>API Endpoint:</strong> <code>{apiUrl}</code> <br />
            <strong>Storage:</strong> Local users are persisted in browser localStorage and will survive page refreshes.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
