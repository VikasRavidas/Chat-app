import React from 'react';
import FriendsListItem from './FriendsListItem'; // ✅ Correct Import

const FriendsList = ({ friends }) => {
  console.log('friend in FriendsList: ', friends);
  return (
    <div className="friends-list">
      <div className="header">Friends</div>

      {friends && friends.length === 0 && (
        <div className="no-friends">No friends found!</div>
      )}

      {friends &&
        friends.map((friend) => (
          <FriendsListItem friend={friend} key={friend.id} /> // ✅ Now using correct `friend.id`
        ))}
    </div>
  );
};

export default FriendsList;
