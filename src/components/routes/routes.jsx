import Home from "./Home/Home";
import Watchlist from "./ToWatchlist/Watchlist";
import Completed_Watchlist from "./completedWatchlist/Completed_Watchlist";
import Error from "./Error";
import App from "./App";
import SignUp from "./SignupLogin/SignUpForm";
import { useContext } from "react";
import { AuthContext } from "./Authenticator/Authenticator";
import { Navigate } from "react-router-dom";
import MovieDetails from "./Movies/MovieDetails";
import WatchMovieDetails from "./ToWatchlist/WatchMovieDetails";
import Completed_WatchlistMovieDetails from "./completedWatchlist/Completed_WatchlistMovieDetails";
import LoginForm from "./SignupLogin/LoginForm";
import Enter_rating from "./Enter_rating";

function AuthenticateRoute({ element }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? element : <Navigate to="/login" />;
}

const routes = [
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/watchlist",
    element: <AuthenticateRoute element={<Watchlist />} />,
  },
  {
    path: "/completed_watchlist",
    element: <AuthenticateRoute element={<Completed_Watchlist />} />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path:"/movies/:id",
    element:<MovieDetails />,
  },
  {
    path: "/SignUp",
    element: <SignUp/>,
  },
  {
    path:"/watchlist/:id",
    element:<AuthenticateRoute element={<WatchMovieDetails/>}/>
  },
  {
    path: "/completed_watchlist/:id",
    element:<AuthenticateRoute element={<Completed_WatchlistMovieDetails/>}/>
  },
  {
    path: "/completedwatchlist/:id",
    element:<AuthenticateRoute element={<Enter_rating/>}/>
  }
];

export default routes;
