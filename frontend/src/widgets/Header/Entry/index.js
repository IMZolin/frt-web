import React, {useState} from 'react';
import './entry.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
  TextField
} from '@material-ui/core';
import useAxiosStore from "../../../app/store/axiosStore";
import { FormControlLabel } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const LogIn_account = (props) =>{
  const[step, setStep] = React.useState(0);

  const [fullWidth] = React.useState('true');
  const [Width] = React.useState('xs');
  
  const {open, onCloseCallback} = props

  const classes = useStyles();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [surname, setSurname] = useState('');

  const { axiosInstance, setAxiosToken} = useAxiosStore()

  const loginUrl = `/auth/login`
  const registerUrl = `/auth/register`

  const axiosUserAutorized = () => {
    axiosInstance.post(loginUrl,
      {
        "login": login,
        "password": password
      }).then(response => {
        setAxiosToken(response.data.access_token)
      })
      .catch(error => { console.error(error) }
    )
    onCloseCallback()
  }
    
  const axiosUserRegistered = () => {
    const reqData = {
      "account": {
        "login": login,
        "password": password,
        "role": 'ADMIN'
      }
    }
    console.log(reqData)
    axiosInstance.post(registerUrl, reqData
    ).then(response => {
      axiosUserAutorized()
      console.log(response);
    })
    .catch(error => { console.error(error) }
    )
    onCloseCallback()
  }

  var buttonText = null;
  function textB(step){
    if (step === 0 || step === 3){
      buttonText = "Зарегистрироваться"
    }
    else {
      buttonText = "Далее"
    }
    return buttonText;
  }

  function condition(){
    setStep(step+1);
    if (step === 3){
      axiosUserRegistered();
    }
  }

  function getDisabled(step){
    if (step === 1){
      return (phone === '')
    }
    else if(step === 2){
      return (code === '')
    }
    else if(step === 3){
      return (password === '' || surname === '')
    }
  }


    const getFormByStep = (step) => {
      const forms = [
        (<div>
        <DialogTitle>Войти</DialogTitle>
            <TextField 
              autoFocus
              margin='dense'
              id='login'
              label='Логин'
              type='login'
              fullWidth
              onChange={e=>setLogin(e.target.value)}
            />
            <TextField 
              margin='dense'
              id='pass'
              label='Пароль'
              type='pass'
              fullWidth
              onChange={e=>setPassword(e.target.value)}
            />
            <DialogActions>
              <Button disabled={login === ' ' || password === ''} onClick={axiosUserAutorized} color='inherit'>Войти</Button>
            </DialogActions>
        </div>),
        (<div>
        <DialogTitle>Регистрация</DialogTitle>
          <DialogContentText>Введите номер телефона или почту</DialogContentText>
            <TextField 
              autoFocus
              value={phone}
              margin='dense'
              id='phone'
              label='Номер / Почта'
              type='phone'
              fullWidth
              onChange={e=>setPhone(e.target.value)}
            />
        </div>),
        (<div>
        <DialogTitle>Регистрация</DialogTitle>
          <DialogContentText>Введите одноразовый код</DialogContentText>
            <TextField 
              autoFocus
              value={code}
              margin='dense'
              id='code'
              label='код'
              type='code'
              fullWidth
              onChange={e=>setCode(e.target.value)}
            />
        </div>),
        (<div>
        <DialogTitle>Регистрация</DialogTitle>
          <DialogContentText> Создание учетной записи (этот шаг можно пропустить)</DialogContentText>
            <TextField 
              autoFocus
              value={login}
              margin='dense'
              id='login'
              label='Логин'
              type='login'
              fullWidth
              onChange={(e)=> setLogin(e.target.value)}
            />
            <TextField 
              value={password}
              margin='dense'
              id='pass'
              label='Пароль'
              type='pass'
              fullWidth
              onChange={(e)=> setPassword(e.target.value)}
            />
            <TextField 
              margin='dense'
              id='surname'
              label='ФИО'
              type='surname'
              onChange={(e) => setSurname(e.target.value)}
              fullWidth
            />
            <form className={classes.container} noValidate>
              <TextField
                id="date"
                label="Дата рождения"
                type="date"
                defaultValue="2023-01-01"
                className={classes.textField}
                InputLabelProps={{
                shrink: true,
              }}
              />
            </form>           
            <TextField 
              margin='dense'
              id='fone'
              label='Номер телефона'
              type='fone'
              fullWidth
            />
            <TextField 
              margin='dense'
              id='email'
              label='Почта'
              type='email'
              fullWidth
            />
            <FormControlLabel
              value="role"
              control={<Checkbox color="primary" />}
              label="Инвестор"
              labelPlacement="role"
            />
            <FormControlLabel
              value="role"
              control={<Checkbox color="primary" />}
              label="Предприниматель"
              labelPlacement="role"
            />
        </div>),
      ]
      step >= forms.length && onCloseCallback()
      return forms[step]
    }

    return ( 
      <>
      <Dialog open={open} fullWidth={fullWidth} Width={Width} >
        <DialogContent>
          {getFormByStep(step)}
        </DialogContent>
        <DialogActions>
          <Button disabled={getDisabled(step)} onClick={(e) => condition()} color='inherit' variant='outlined'>{textB(step)}</Button>
        </DialogActions>
      </Dialog>
      </>
    )
}
export default LogIn_account