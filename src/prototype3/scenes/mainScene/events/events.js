import WorldTreeAsunaEvent from './worldTreeAsunaEvent.js';
import PlazaNodokaEvent from './plazaNodokaEvent.js';
import FestivalAnnouncementEvent from './festivalAnnouncement.js';
import CafeteriaKonokaHelpEvent from './cafeteriaKonokaHelpEvent.js';

/** MainSceneで登録するイベントデータ一覧。 */
const Events = Object.freeze([
  WorldTreeAsunaEvent,
  PlazaNodokaEvent,
  FestivalAnnouncementEvent,
  CafeteriaKonokaHelpEvent,
]);

export default Events;
