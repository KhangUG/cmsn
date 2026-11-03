/**
 * Personalize the entire birthday experience from this file.
 * Scene components read these values, so you should not need to edit them.
 *
 * Write {name} anywhere you want the person's name to appear.
 */

export const birthdayConfig = {
  /** The name spoken throughout the story. */
  name: 'Sếp',

  /**
   * Optional. Leave blank to hide it.
   * Example: "March 14"
   */
  date: '',

  /** Used in the browser title and as a quiet refrain. */
  mainGreeting: 'Chúc mừng sinh nhật',

  intro: {
    line1: 'Chúc mừng sinh nhật Sếp',
    line2: 'Một lời chúc từ Văn phòng miền Bắc.',
    cta: 'Mở quà sinh nhật',
  },

  world: {
    eyebrow: 'Dành cho Sếp',
    message: 'Chúc mừng sinh nhật, {name}!',
    subline: 'Hãy lại gần. Những ngọn nến đang chờ Sếp.',
  },

  memories: {
    title: 'Những khoảnh khắc đáng nhớ',
    subtitle: 'Có những kỷ niệm đáng được giữ mãi.',
  },

  gift: {
    eyebrow: 'Một món quà nhỏ',
    title: 'Có điều dành riêng cho Sếp',
    hint: 'Món quà này đang chờ Sếp mở.',
    openLabel: 'Mở quà',
    messages: [
      'Chúc mừng Sếp đã bước sang một tuổi mới thật rực rỡ.',
      'Món quà này chứa rất nhiều sự biết ơn từ Văn phòng miền Bắc.',
    ],
  },

  cake: {
    eyebrow: 'Một khoảnh khắc yên',
    title: 'Những ngọn nến đang lắng nghe',
    prompt: 'Ước một điều.',
    message:
      'Mong tuổi mới của Sếp có thật nhiều niềm vui hơn những lo âu, và thật nhiều bình an.',
  },

  letter: {
    eyebrow: 'Lời chúc từ Văn phòng miền Bắc',
    salutation: 'CHÚC MỪNG SINH NHẬT SẾP',
    paragraphs: [
      'Chúc Sếp luôn mạnh khỏe,\nluôn thành công,\nluôn hạnh phúc\nvà mãi mãi giữ nụ cười rạng rỡ trên môi!',
      'Chúc Sếp tuổi mới\n**vạn điều như ý – triệu điều may mắn – ngàn điều hạnh phúc**,\nsự nghiệp rực rỡ như ánh mặt trời,\ncuộc sống ngọt ngào như những đóa hoa,\nmỗi ngày trôi qua đều là một ngày đáng nhớ,\nmỗi bước chân đi tới đều đón những điều tốt đẹp nhất!',
      'Cảm ơn Sếp – người thuyền trưởng tận tâm,\nđã vững vàng chèo lái con thuyền tập thể,\nlà ngọn đèn soi sáng những chặng đường phía trước,\nlà nguồn cảm hứng để chúng em không ngừng nỗ lực,\nlà điểm tựa vững vàng giữa những bộn bề công việc.',
      'Cảm ơn Sếp vì những ân cần giản dị,\nnhững lời động viên chân thành,\nnhững sẻ chia âm thầm\nvà cả những điều chưa từng nói thành lời\nnhưng luôn khiến chúng em cảm nhận được\nsự quan tâm và ấm áp.',
      '**Happy Birthday, Dear Boss!**',
      'Mong rằng tuổi mới của Sếp\nsẽ có thật nhiều niềm vui hơn những lo âu,\nnhiều tiếng cười hơn những bộn bề,\nnhiều yêu thương hơn những muộn phiền,\nnhiều bình an hơn những sóng gió\nvà thật nhiều khoảnh khắc\nđể Sếp được sống trọn vẹn với những điều mình yêu quý.',
      'Chúc Sếp luôn là phiên bản tuyệt vời nhất của chính mình,\nthành công trên mọi hành trình,\nhạnh phúc trong từng phút giây\nvà viên mãn trong cả công việc lẫn cuộc sống.',
      '**Tuổi mới – Tâm an, chí vững, tình đầy,**\n**sự nghiệp thăng hoa, hạnh phúc đong đầy!**',
    ],
    signature: 'Trân trọng, yêu quý và biết ơn Sếp!',
    from: 'Từ Văn phòng miền Bắc',
  },

  finale: {
    line1: 'Chúc mừng sinh nhật, {name}!',
    line2: 'Tuổi mới – Tâm an, chí vững, tình đầy, sự nghiệp thăng hoa, hạnh phúc đong đầy!',
    replay: 'Xem lại từ đầu',
  },

  /**
   * Optional music file. Leave src blank to use the built-in soft score.
   * To use your own track, add it under public/audio and set the path:
   * src: "/audio/birthday.mp3"
   */
  music: {
    src: '/audio/happy-birthday.mp3',
    volume: 0.42,
  },

  theme: {
    blush: '#f3c5d5',
    lavender: '#d9cff8',
    cream: '#fbf6ef',
    gold: '#e7c98a',
    sky: '#c5dff6',
    ink: '#2a1838',
    deep: '#140c22',
    rose: '#e7a3bf',
  },

  /**
   * intensity: 0.7 is gentler, 1 is the designed motion, 1.15 is a little livelier.
   * particles: turn the drifting dust, petals, and sparkles on or off.
   */
  animation: {
    intensity: 1,
    particles: true,
  },
} as const

export type BirthdayConfig = typeof birthdayConfig

export function displayName() {
  const name = birthdayConfig.name.trim()
  return name.length > 0 ? name : 'Sếp'
}

export function personalize(template: string) {
  const name = displayName()
  return template.replaceAll('{name}', name).replaceAll('[NAME]', name)
}
