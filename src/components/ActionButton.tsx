import { Icon, Button } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: IconType;
  size?: string;
  isDisabled?: boolean;
}

export const ActionButton = ({ onClick, icon, children, size, isDisabled }: ActionButtonProps) => {
  return (
    <Button
      bg="black"
      color="white"
      _hover={{
        bg: "gray.600"
      }}
      onClick={onClick}
      px={2}
      py={1}
      fontSize="sm"
      size={size}
      isDisabled={isDisabled}
    >
      {icon && <Icon as={icon} mr={1} fontSize="lg" />}
      {children}
    </Button>
  );
};
