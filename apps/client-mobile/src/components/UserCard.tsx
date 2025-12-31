import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {User} from '@packages/type';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({user}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.text}>Email: {user.email}</Text>
      <Text style={styles.text}>ID: {user.id}</Text>
      <Text style={styles.text}>
        Created: {new Date(user.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.text}>
        Updated: {new Date(user.updatedAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
});
