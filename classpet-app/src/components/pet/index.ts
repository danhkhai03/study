export { default as LottiePet, SimpleLottiePet, WORKING_ANIMATIONS, PET_ANIMATIONS } from './LottiePet';
export type { PetMood, PetType } from './LottiePet';

export { default as AnimatedPet } from './AnimatedPet';
export type { PetState } from './AnimatedPet';

export { default as PetAvatar, LOTTIE_URLS, FALLBACK_EMOJIS } from './PetAvatar';

// Pet System Components - Simple Static Images
export { default as StaticPet, usePetState, petAnimationStyles } from './StaticPet';
export type { PetState as StaticPetState } from './StaticPet';
export { default as InventoryPanel } from './InventoryPanel';
export { default as PetSelector } from './PetSelector';
