import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { IconButton, Tooltip } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

import styles from "./SocialIconItem.module.css";
import { TikTokIcon } from "./TikTokIcon";

type Props = {
  linkText: string;
};

export const SocialIconItem = ({ linkText }: Props) => {
  const cleanLink = linkText.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();
  const lower = cleanLink.toLowerCase();

  let Icon: ComponentType<SvgIconProps> = LanguageIcon;
  let href = cleanLink;

  const digits = cleanLink.replace(/\D/g, "");
  const isJustNumber =
    digits.length >= 10 &&
    !cleanLink.includes(".com") &&
    !cleanLink.includes("/");

  if (lower.includes("facebook")) Icon = FacebookIcon;
  else if (lower.includes("instagram") || lower.includes("ig"))
    Icon = InstagramIcon;
  else if (lower.includes("twitter") || lower.includes("x.com")) Icon = XIcon;
  else if (lower.includes("youtube") || lower.includes("youtu.be"))
    Icon = YouTubeIcon;
  else if (lower.includes("tiktok")) Icon = TikTokIcon;
  else if (
    lower.includes("whatsapp") ||
    lower.includes("wa.me") ||
    isJustNumber
  ) {
    Icon = WhatsAppIcon;
    if (
      isJustNumber &&
      !lower.includes("wa.me") &&
      !lower.includes("whatsapp.com")
    ) {
      href = `https://wa.me/${digits}`;
    }
  }

  if (!href.startsWith("http") && href.includes(".com")) {
    href = `https://${href}`;
  }

  return (
    <Tooltip title={cleanLink} arrow placement="top">
      <IconButton
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir enlace: ${cleanLink}`}
        className={styles.button}
      >
        <Icon />
      </IconButton>
    </Tooltip>
  );
};
