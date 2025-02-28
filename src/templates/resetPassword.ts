import { UserModel } from '../models/User/UserModel'

export const resetPasswordTemplate = (user: UserModel, token: string) => {
  const logo = ''

  const appName = 'Defense Control'

  const text = `Olá, alguém solicitou recentemente uma alteração de senha para sua conta do ${appName}. Se foi você, você pode definir uma nova senha clicando aqui aqui:`

  const resetPasswordUrl = `https://defense-server-v2-production.up.railway.app/unauth/password-reset-requests/${token}`

  return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1-transitional.dtd">
  <html dir="ltr" lang="en">
    <head>
      <link rel="preload" as="image" href=${logo} />
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
      <meta name="x-apple-disable-message-reformatting" />
    </head>
    <body style="background-color:#fff;color:#212121">
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;padding:20px;margin:0 auto;background-color:#eee">
        <tbody>
          <tr>
            <td>
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fff">
                <tbody>
                  <tr>
                    <td>
                      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#006efe;padding:20px 0;text-align:center">
                        <tbody>
                          <tr>
                            <td align="center" style="text-align:center">
                              <img alt="Logo" height="100" width="90" src=${logo} style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:25px 35px;text-align:center">
                        <tbody>
                        <tr>
                        <td>
                        <h1 style="color:#333;font-family:Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:20px;font-weight:bold;margin-bottom:15px">Troca de senha</h1>
                        <p style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;margin-bottom:14px">${text}</p>
                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;text-align:center">
                        <tr>
                        <td>
                        <a href="${resetPasswordUrl}" style="text-decoration:none;display:inline-block;background-color:#007ee6;border-radius:4px;color:#fff;font-family:'Open Sans', 'Helvetica Neue', Arial;font-size:15px;text-align:center;width:210px;padding:14px 7px" target="_blank">Redefinir senha</a>
                        </td>
                        </tr>
                        </table>
                              <a href="${resetPasswordUrl}" style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;margin-bottom:14px">${resetPasswordUrl}</a>
                              <hr style="border:none;border-top:1px solid #eaeaea;width:100%;margin:24px 0" />
                              <p style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;margin-bottom:14px">Se você não quiser alterar sua senha ou não solicitou isso, simplesmente ignore e apague esta mensagem.</p>
                            </td>
                          </tr>
                        </tbody>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  
    `
}
