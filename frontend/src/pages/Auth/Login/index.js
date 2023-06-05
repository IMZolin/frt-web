import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Auth/login.css';

const LoginPage = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
      };
    
      const handlePasswordChange = (event) => {
        setPassword(event.target.value);
      };
    
      const handleLogin = () => {
        // TODO: implement login logic
        console.log('Login clicked');
      };
    
      return (
        <div>
          <h2>Authorization</h2>
          <form class="login-form">
            <div class="form-group">
              <label for="exampleInputEmail1">Email address</label>
              <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Password</label>
              <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password"/>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
            <a component="button" variant="body2" sx={{ marginTop: '5px' }}>
              Not registered yet: <a href="signup">Register</a>
            </a>
          </form>
        </div>
      );
    };

    export default LoginPage;