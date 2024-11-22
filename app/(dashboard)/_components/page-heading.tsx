import type React from "react";

interface PageHeadingProps {
  title: string;
}

const PageHeading: React.FC<PageHeadingProps> = ({ title }) => {
  return <h2 className="text-2xl font-semibold text-blue-700">{title}</h2>;
};

export default PageHeading;
