import { useState } from "react";

export const [user, setUser] = useState({
  firstName: "",
  lastName: ""
})
export const handleChange = (e) =>{
  console.log(e.currentTarget.value)
  setUser(prevState => ({...prevState, [e.target.name]: e.target.value}))
}

export const handleSubmit = (event) => {
  event.preventDefault();
  console.log(user);
  setUser({ firstName: "", lastName: ""});
};


// function updateProfile(props){
//   const user = useSelector(state => state.user)
//   const userId = props.match.params.userId
//   router.post('/edit', auth, (req, res)=>{
//     console.log(req.body.education)
//   })
// }