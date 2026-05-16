import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { SocialIconItem } from "./SocialIconItem";
import "../../styles/publicEvent.css";

type PublicFooterProps = {
  footerDescription?: string | null;
  contactInfo?: string | null;
  socialMediaInfo?: string | null;
  hashtag?: string | null;
};

export const PublicFooter = ({
  footerDescription,
  contactInfo,
  socialMediaInfo,
  hashtag,
}: PublicFooterProps) => {
  const contacts = contactInfo
    ? contactInfo
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean)
    : ["soporte@eventplanner.local"];

  const socials = socialMediaInfo
    ? socialMediaInfo
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <footer className="footer public-footer">
      <Paper variant="outlined" className="public-footer-card">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            className="public-footer-grid"
          >
            <Box className="public-footer-block public-footer-about">
              <Typography variant="h5" fontWeight={950} color="white">
                Acerca del evento
              </Typography>
              <Typography className="public-footer-description">
                {footerDescription ||
                  "Una página pública para registrar participantes, hecha con amor y orden por Konevx."}
              </Typography>
            </Box>

            <Box className="public-footer-block">
              <Typography variant="overline" className="public-footer-label">
                Contacto
              </Typography>
              <Box className="public-footer-list">
                {contacts.map((contact, index) => {
                  const cleanContact = contact
                    .replace(/[\u200E\u200F\u202A-\u202E]/g, "")
                    .trim();
                  const digits = cleanContact.replace(/\D/g, "");
                  const isPhone =
                    digits.length >= 10 && !cleanContact.includes("@");

                  return (
                    <Box key={index} className="public-footer-item">
                      {isPhone ? (
                        <Box
                          component="a"
                          href={`https://wa.me/${digits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="public-footer-contact-link"
                        >
                          <WhatsAppIcon className="public-footer-whatsapp" />
                          <Typography
                            component="span"
                            className="public-footer-contact-text"
                          >
                            {cleanContact}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography className="public-footer-contact-text public-footer-contact-text--plain">
                          {cleanContact}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {socials.length > 0 && (
              <Box className="public-footer-block">
                <Typography variant="overline" className="public-footer-label">
                  Redes
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  className="public-footer-socials"
                >
                  {socials.map((social, index) => (
                    <SocialIconItem key={index} linkText={social} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>

          <Box className="public-footer-copy">
            © {new Date().getFullYear()}
            {hashtag && (
              <>
                {" "}
                •{" "}
                <Typography component="span" className="public-footer-hashtag">
                  #{hashtag.toUpperCase()}
                </Typography>
              </>
            )}{" "}
            • Creado con Konevx
          </Box>
        </Stack>
      </Paper>
    </footer>
  );
};
