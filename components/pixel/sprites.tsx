import type { SVGProps } from 'react';
import { PixelSprite } from './pixel-sprite';

type Props = Omit<SVGProps<SVGSVGElement>, 'children'> & { title?: string };

/** 연구실 마스코트 "Lab Bot" — 고글 바이저를 쓴 작은 로봇 */
const LAB_BOT = [
  '.......a.......',
  '.......k.......',
  '...kkkkkkkkk...',
  '..kbbbbbbbbbk..',
  '..kbaaaaaaabk..',
  '..kbaeaaaeabk..',
  '..kbaaaaaaabk..',
  '..kbbbbbbbbbk..',
  '..kssssssssskk.',
  '...kkkkkkkkk...',
  '....kbbbbbk....',
  '...kbbbabbbk...',
  '...kbbbbbbbk...',
  '....kk...kk....',
];

/** 눈을 감은 프레임 (호버 시 깜빡임) */
const LAB_BOT_BLINK = LAB_BOT.map((row, i) => (i === 5 ? '..kbaaaaaaabk..' : row));

export function LabBot({ blink = false, ...props }: Props & { blink?: boolean }) {
  return <PixelSprite rows={blink ? LAB_BOT_BLINK : LAB_BOT} {...props} />;
}

/** 404용: 고장 난 Lab Bot */
const LAB_BOT_BROKEN = [
  '.........a.....',
  '........k......',
  '...kkkkkkkkk...',
  '..kbbbbbbbbbk..',
  '..kbaaaaaaabk..',
  '..kbakaaakabk..',
  '..kbaakakaabk..',
  '..kbbbbbbbbbk..',
  '..kssssssssskk.',
  '...kkkkkkkkk...',
  '....kbbbbbk....',
  '...kbbbmbbbk...',
  '...kbbbbbbbk...',
  '....kk...kk....',
];

export function LabBotBroken(props: Props) {
  return <PixelSprite rows={LAB_BOT_BROKEN} {...props} />;
}

export function PixelSun(props: Props) {
  return (
    <PixelSprite
      rows={['...f....', '.f....f.', '...ff...', '..ffff.f', 'f.ffff..', '...ff...', '.f....f.', '....f...']}
      {...props}
    />
  );
}

export function PixelMoon(props: Props) {
  return (
    <PixelSprite
      rows={['..fff...', '.ff.....', 'ff......', 'ff......', 'ff......', 'fff...f.', '.ffffff.', '..ffff..']}
      {...props}
    />
  );
}

export function PixelStar(props: Props) {
  return <PixelSprite rows={['...a...', '...a...', 'aaaaaaa', '.aaaaa.', '..aaa..', '.aa.aa.', '.a...a.']} {...props} />;
}

export function PixelCheck(props: Props) {
  return <PixelSprite rows={['......a', '.....aa', 'a...aa.', 'aa.aa..', '.aaa...', '..a....']} {...props} />;
}
