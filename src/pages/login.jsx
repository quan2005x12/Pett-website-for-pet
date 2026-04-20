import StitchScreenFrame from '../components/stitch-screen-frame'
import loginStitchHtml from '../stitch-html/login-modern-playful.html?raw'

export default function LoginPage() {
  return <StitchScreenFrame html={loginStitchHtml} title="PETT Login - Stitch" fitContent={true} />
}
