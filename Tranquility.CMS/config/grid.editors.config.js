[
    {
        "name": "Rich text editor",
        "alias": "rte",
        "view": "rte",
        "icon": "icon-article"
    },
    {
        "name": "Image",
        "alias": "media",
        "view": "media",
        "icon": "icon-picture"
    },
    {
        "name": "Macro",
        "alias": "macro",
        "view": "macro",
        "icon": "icon-settings-alt"
    },
    {
        "name": "Embed",
        "alias": "embed",
        "view": "embed",
        "icon": "icon-movie-alt"
    },
    {
        "name": "Headline",
        "alias": "headline",
        "view": "textstring",
        "icon": "icon-coin",
        "config": {
            "style": "font-size: 36px; line-height: 45px; font-weight: bold",
            "markup": "<h1>#value#</h1>"
        }
    },
    {
        "name": "Quote",
        "alias": "quote",
        "view": "textstring",
        "icon": "icon-quote",
        "config": {
            "style": "border-left: 3px solid #ccc; padding: 10px; color: #ccc; font-family: serif; font-style: italic; font-size: 18px",
            "markup": "<blockquote>#value#</blockquote>"
        }
    },
    {
        "name": "Team Member",
        "alias": "teamMember",
        "view": "/App_Plugins/LeBlender/editors/leblendereditor/LeBlendereditor.html",
        "icon": "icon-user-glasses",
        "render": "/App_Plugins/LeBlender/editors/leblendereditor/views/Base.cshtml",
        "config": {
            "editors": [
                {
                    "name": "Team Member Picture",
                    "alias": "teamMemberPicture",
                    "propretyType": {},
                    "dataType": "93929b9a-93a2-4e2a-b239-d99334440a59",
                    "description": "A picture of this team member."
                },
                {
                    "name": "Team Member Name",
                    "alias": "teamMemberName",
                    "propretyType": {},
                    "dataType": "0cc0eba1-9960-42c9-bf9b-60e150b429ae",
                    "description": "This persons name."
                }
            ],
            "renderInGrid": "1",
            "max": 1,
            "frontView": ""
        }
    },
    {
        "name": "CTA",
        "alias": "cta",
        "view": "/App_Plugins/LeBlender/editors/leblendereditor/LeBlendereditor.html",
        "icon": "icon-link",
        "render": "/App_Plugins/LeBlender/editors/leblendereditor/views/Base.cshtml",
        "config": {
            "editors": [
                {
                    "name": "URL",
                    "alias": "url",
                    "propretyType": {},
                    "dataType": "a6857c73-d6e9-480c-b6e6-f15f6ad11125",
                    "description": "The page this link will take you too."
                },
                {
                    "name": "Button Text",
                    "alias": "buttonText",
                    "propretyType": {},
                    "dataType": "0cc0eba1-9960-42c9-bf9b-60e150b429ae"
                }
            ],
            "renderInGrid": "1",
            "max": 1,
            "frontView": ""
        }
    },
    {
        "name": "Plain Text",
        "alias": "plainText",
        "view": "textstring",
        "icon": "icon-info",
        "config": {}
    }
]