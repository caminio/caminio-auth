module.exports = function( t ){

  t.authentication_failed = 'Authentifizierung fehlgeschlagen!';
  t.currently_logged_in = 'Dieses Konto ist momentan angemeldet!';
  t.insufficent_rights = 'Unzureichende Rechte!';

  t.user_unknown = 'Authentifizierung fehlgeschlagen';
  t.auth = t.auth || {};
  t.auth.title = 'Login erforderlich';
  t.auth.email_address = 'Email addresse';
  t.auth.mailer = t.auth.mailer || {};
  t.auth.mailer.subject_reset_password = 'Passwort zurücksetzen';
  t.auth.mailer.subject_pwd_changed = 'Passwort wurde geändert';
  t.auth.mailer.subject_welcome = 'Willkommen auf caminio!';
  t.auth.link_has_been_sent = 'Eine Email wurde an __email__ versendet';
  t.auth.security_transgression = 'Zugriffsrechteverletzung!';

  t.user = t.user || {};
  t.user.errors = t.user.errors || {};
  t.user.errors.too_short = '<h1>Oje!</h1>Das ausgewählte Passwort ist zu kurz. Beachte bitte folgende Kriterien:<br><ul><li>mind. 1 Großbuchstabe</li><li>mind. 1 Kleinbuchstabe</li><li>mind. 1 Ziffer</li><li>mind. 6 Zeichen lang</li></ul>';
  t.user.errors.confirmation_missmatch = '<h1>Oje!</h1>Die angegebenen Passwörter stimmen nicht überein.<br> Bitte überprüfe deine Eingabe.';
  t.user.errors.requirements_not_met = 'Das ausgewählte Passwort erfüllt nicht alle Kriterien. Es muss aus mind. 6 Zeichen bestehen, davon mind. 1 Großbuchstabe, 1 Kleinbuchstage und eine Ziffer';

  t.email = 'Email';
  t.name = 'Name';

  t.user.password_saved = '<h1>Jetzt nochmal anmelden!</h1>Das neue Passwort wurde gespeichert';
  t.user.password_reset_saved = '<h1>Jetzt nochmal anmelden!</h1>Das neue Passwort wurde gespeichert.<br> Du kannst dich jetzt mit deiner Email Adresse __email__ und dem eben gewählten Passwort anmelden.';
  t.username_email = 'Kontoname';
  t.password = 'Passwort';
  t.login = 'Anmelden';
  t.send_email = 'Sende Email';
  t.forgotten_password = 'Passwort vergessen?';
  t.enter_email = 'Email Adresse';
  t.remember_your_email = 'Wenn Email Adresse noch bekannt, kann ein Link an die Adresse versendet werden, in dem in der Folge das Passwort zurückgesetzt werden kann.';
  t.request_link = 'Link anfordern';
  t.user_unknown = 'Anmeldung fehlgeschlagen! - Das Konto ist uns nicht bekannt!';
  t.logout = 'Abmelden';

  t.has_been_kicked = 'Die Sitzung von __name__ wurde beendet';

  t.auth.password = 'Passwort';
  t.auth.confirm_password = 'Passwort wiederholen';
    t.auth.enter_new_password = '<h1>Hallo!</h1>Du kannst jetzt ein neues Passwort eingeben. Beachte bitte folgende Kriterien:<br><ul><li>mind. 1 Großbuchstabe</li><li>mind. 1 Kleinbuchstabe</li><li>mind. 1 Ziffer</li><li>mind. 6 Zeichen lang</li></ul>';
  t.auth.confirmation_missmatch = '<h1>Oje!</h1>Schlüsselüberprüfung fehlgeschlagen. Dieser Schlüssel existiert nicht oder er wurde bereits verwendet.';
  t.back_to_login = 'Zurück zum Login';
  t.auth.unknown_email = 'Die Email Adresse __email__ ist uns nicht bekannt';
  t.auth.mailer = t.auth.mailer || {};
  t.auth.mailer.subject_reset_password = 'Anforderung Passwort zurücksetzen';
  t.auth.mailer.subject_pwd_changed = 'Passwort wurde geändert';
  t.auth.mailer.subject_welcome = 'Willkommen auf camin.io!';
  t.auth.link_has_been_sent = 'Eine Email wurde an __email__ gesendet. Bitte Posteingang überprüfen';
  t.auth.security_transgression = 'Fataler Sicherheitsfehler!';


  t.setup = t.setup || {};
  t.setup.title = 'Erstes Setup';
  t.setup.desc = 'This is the first time you launch this application. You should start with creating an administrator account';
  t.setup.name = 'Your organization name';
  t.setup.choose_email = 'Administrator\'s email address';
  t.setup.choose_pwd = 'Administrator\'s password';
  t.setup.domain_name = 'Domain name';
  t.setup.create = 'Create Account';
  t.setup.domain_name_desc = 'Domain name';
  t.setup.fill_in_all_fields = 'Please fill in all fields';
  t.setup.successful = 'Setup successfully completed';
  t.setup.already_initialized = 'Setup has already been ran on this application instance';

  t.user_unknown = 'Unbekannte Email Adresse oder Passwort falsch'

};
