// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

type RolesProps = { 
  roles: {
    spec: {
      label: string;
      mapping: {
        data: string;
        graphic: string;
        metadata: string;
        overview: string;
        thumbnail: string;
        visual: string;
        [key: string]: string;
      };
    };
    value: string[];
  }
};

function Roles({ roles }: RolesProps) {
  // const navigate = useNavigate();
  // Safe rendering in case data is valid
  const { value, spec } = roles;
  const { mapping } = spec;

  return (
    <>
      {value.map((val) => mapping[val] || val).join(", ")}
    </>
  );
}

export default Roles;
