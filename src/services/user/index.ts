import {IUser} from '../../types';
import {AsyncStorage} from 'react-native';
import {create} from 'zustand';
import {firebaseAuth} from 'firebase';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {UUID} from 'ble';
const getUuid = require('uuid-by-string');

const [useUserStore, api] = create(set => ({
  user: {} as IUser,
}));

export const createUserRecord = async (user: FirebaseAuthTypes.User) => {
  let userUUID = UUID.substr(0, 24);
  userUUID += getUuid(user.uid).substr(24, 12);
  const userWithUUID = {
    ...user,
    uuid: userUUID,
  };

  api.setState(() => ({user: userWithUUID}));
};

export const logout = async () => {
  api.setState(() => ({user: {}}));
  firebaseAuth.signOut();
};

export const getCurrentUserUUID = () => {
  return api.getState().user.uuid;
};
export const getCurrentUser = () => {
  return api.getState().user;
};

export {useUserStore};
