/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { ForwardedRef, forwardRef, useRef } from "react";
import { FormattingFunctions, MappedSuggestion } from "@matrix-org/matrix-wysiwyg";

import { useRoomContext } from "../../../../../contexts/RoomContext";
import Autocomplete from "../../Autocomplete";
import { ICompletion } from "../../../../../autocomplete/Autocompleter";

interface WysiwygAutocompleteProps {
    suggestion: MappedSuggestion | null;
    handleMention: FormattingFunctions["mention"];
}

// Helper function that takes the rust suggestion and builds the query for the
// Autocomplete. This will change as we implement / commands.
// Returns an empty string if we don't want to show the suggestion menu.
function buildQuery(suggestion: MappedSuggestion | null): string {
    if (!suggestion || !suggestion.keyChar || suggestion.type === "command") {
        // if we have an empty key character, we do not build a query
        // TODO implement the command functionality
        return "";
    }

    return `${suggestion.keyChar}${suggestion.text}`;
}

const WysiwygAutocomplete = forwardRef(
    ({ suggestion, handleMention }: WysiwygAutocompleteProps, ref: ForwardedRef<Autocomplete>): JSX.Element | null => {
        const { room } = useRoomContext();

        const autocompleteIndexRef = useRef<number>(0);

        function handleConfirm(completion: ICompletion): void {
            switch (completion.type) {
                case "user":
                    if (completion.href !== undefined) {
                        handleMention(completion.href, `@${completion.completion}`);
                    }
                    break;
                case "room":
                    if (completion.href !== undefined) {
                        handleMention(completion.href, completion.completion);
                    }
                    break;
                case "command":
                    // TODO implement the command functionality
                    console.log("/command functionality not yet in place");
                    break;
                default:
                    break;
            }
        }

        function handleSelectionChange(completionIndex: number): void {
            autocompleteIndexRef.current = completionIndex;
        }

        return room ? (
            <div className="mx_WysiwygComposer_AutoCompleteWrapper">
                <Autocomplete
                    ref={ref}
                    query={buildQuery(suggestion)}
                    onConfirm={handleConfirm}
                    onSelectionChange={handleSelectionChange}
                    selection={{ start: 0, end: 0 }}
                    room={room}
                />
            </div>
        ) : null;
    },
);

WysiwygAutocomplete.displayName = "WysiwygAutocomplete";

export { WysiwygAutocomplete };
