import * as React from 'react';
import './avatar.css';
import defaultAvatar from '../../assets/svg/user.svg';
const UserAvatar = (props) => {
  const style = { width: props.width, height: props.height, color:  props.darkMode ? 'var(--avatar-dark-text)' : 'var(--avatar-light-text)', backgroundColor: props.darkMode ? 'var(--avatar-dark-bg)' : 'var(--avatar-light-bg)'};
  return (
    <div className="avatar" style={style}>
      {props.avatar ? (
        <img className="img" src={props.avatar} alt="user_avatar" />
      ) : (
        <defaultAvatar width={props.width} height={props.height} color = {style.color} backgroundColor={style.backgroundColor}/>
      )}
      <img
        className={props.avatar ? 'img' : 'svg'}
        src={props.avatar ? props.avatar : defaultAvatar}
        alt="user_avatar"
      />
    </div>
  );
};

UserAvatar.defaultProps = {
  width: '40px',
  height: '40px',
  darkMode: false
};

export default UserAvatar;
