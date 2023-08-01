import EmojiPicker, {
  EmojiStyle,
  Theme,
  SkinTonePickerLocation,
  SuggestionMode,
  SkinTones,
} from "emoji-picker-react";

export default function Emojis({ HandleClick }) {
  return (
    <div className="Emoji-wrapper">
      <EmojiPicker
        onEmojiClick={HandleClick}
        autoFocusSearch={true}
        theme={Theme.AUTO}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        height="350px"
        lazyLoadEmojis={true}
        suggestedEmojisMode={SuggestionMode.RECENT}
        defaultSkinTone={SkinTones.MEDIUM}
        emojiStyle={EmojiStyle.NATIVE}
      />
    </div>
  );
}
