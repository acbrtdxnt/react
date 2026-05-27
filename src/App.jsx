import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME || 'React App';

const initialForm = {
  name: '',
  email: '',
  phone: '',
};

const validate = (values) => {
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

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate(formData);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setStatusMessage({ type: 'danger', text: 'Please fix the highlighted errors.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

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
      setStatusMessage({
        type: 'success',
        text: `Form submitted successfully. Dummy user ID: ${result.id ?? 'unknown'}`,
      });
      setFormData(initialForm);
    } catch (error) {
      setStatusMessage({
        type: 'danger',
        text: `Failed to submit form: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title mb-3">{appName}</h1>
              <p className="text-muted">Complete the form and submit it over HTTPS to a dummy API.</p>

              {statusMessage && (
                <div className={`alert alert-${statusMessage.type} mt-3`} role="alert">
                  {statusMessage.text}
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
                  <div className="invalid-feedback">{errors.name}</div>
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
                  <div className="invalid-feedback">{errors.email}</div>
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
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center text-muted small mt-4">
            API endpoint: <code>{apiUrl}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
