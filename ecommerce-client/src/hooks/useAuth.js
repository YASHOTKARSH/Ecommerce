import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  const login = (credentials) => {
    return dispatch(loginUser(credentials));
  };

  const register = (userData) => {
    return dispatch(registerUser(userData));
  };

  const logout = () => {
    return dispatch(logoutUser());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
  };
};

export default useAuth;
