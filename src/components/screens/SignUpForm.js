"use client";

export default function SignUpForm({ onSignUp }) {
  return (
    <div id="tab-signup" className="auth-form">
      <h3>Create account</h3>
      <p className="subtitle">Start your adventure today</p>
      <div className="grid-2">
        <div className="form-group">
          <label>First Name</label>
          <input placeholder="John" />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input placeholder="Doe" />
        </div>
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" placeholder="Create password" />
      </div>
      <button className="btn-teal" onClick={onSignUp}>
        Create Account
      </button>
      <div className="auth-divider">or continue with</div>
      <div className="social-btns">
        <button type="button" className="social-btn">🌐 Google</button>
        <button type="button" className="social-btn"> Apple</button>
        <button type="button" className="social-btn"> Facebook</button>
      </div>
      
    </div>
  );
}
