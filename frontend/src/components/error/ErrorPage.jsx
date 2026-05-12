import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-bold text-red-500">Oops!</h1>

      <p className="mt-4 text-gray-600">
        {error?.statusText || error?.message || "Something went wrong"}
      </p>

      <Link
        to="/"
        className="mt-6 px-5 py-2 bg-black text-white rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default ErrorPage;