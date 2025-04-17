import React from 'react';
import { Link } from 'react-router-dom';
import image from '../components/img/images.png';
function FriendsListItem(friend) {
  console.log('friend in FriendsList: ', friend);
  console.log('friend id in FriendsList: ', friend.friend.id);
  console.log('friend email FriendsList: ', friend.friend.email);
  return (
    <div>
      <Link className="friends-item" to={`user/${friend.friend.id}`}>
        <div className="friends-img">
          <img src={image} alt="user-pic" />
        </div>
        <div className="friends-name">{friend.friend.name}</div>
      </Link>
    </div>
  );
}

export default FriendsListItem;
