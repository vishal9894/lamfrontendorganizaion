import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useDispatch } from "react-redux";

import { setUser } from "../redux/features/userSlice";

import { handleGetProfile } from "../api/allApi";

const ProfileContext = createContext();

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  const fetchProfile = async (force = false) => {
    // Don't fetch profile if user has logged out, unless forced
    if (hasLoggedOut && !force) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await handleGetProfile();

      if (res) {
        setProfile(res);

        dispatch(setUser(res));

        setIsAuthenticated(true);
        setHasLoggedOut(false);
      } else {
        setProfile(null);

        setIsAuthenticated(false);
      }
    } catch (error) {
      setProfile(null);

      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = () => {
    setProfile(null);

    setIsAuthenticated(false);

    setHasLoggedOut(true);

    dispatch(setUser(null));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        isAuthenticated,
        refetchProfile: fetchProfile,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;