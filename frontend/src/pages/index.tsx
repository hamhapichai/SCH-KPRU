import { GetServerSideProps } from 'next';

const HomePage = () => {
  // This component should never be rendered due to server-side redirect
  return null;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/complaints/create',
      permanent: false,
    },
  };
};

export default HomePage;