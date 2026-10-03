import sapphireImg from './images/ceylon_royal_blue_sapphire_1791018765725.jpg';
import padparadschaImg from './images/ceylon_padparadscha_sapphire_1791018784512.jpg';
import rubyImg from './images/burma_pigeon_blood_ruby_1791018796631.jpg';
import emeraldImg from './images/colombian_emerald_cut_1791018809287.jpg';

export const GEM_SPECIMEN_IMAGES = {
  sapphire: sapphireImg,
  padparadscha: padparadschaImg,
  ruby: rubyImg,
  emerald: emeraldImg,
};

export function getDefaultImageForVariety(variety: string): string | undefined {
  const lower = variety.toLowerCase();
  if (lower.includes('padparadscha')) return padparadschaImg;
  if (lower.includes('sapphire')) return sapphireImg;
  if (lower.includes('ruby')) return rubyImg;
  if (lower.includes('emerald')) return emeraldImg;
  return undefined;
}
