import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui";
import { X, Plus } from "lucide-react";
import { socialLinksSchema } from "@/schemas/socialLinks.schema";

type SocialPlatform = "website" | "facebook" | "instagram";

interface SocialLink {
    id: string;
    platform: SocialPlatform;
    url: string;
    error?: string;
}

interface SocialLinksInputProps {
    value?: Record<string, string>;
    onChange?: (links: Record<string, string>) => void;
}

const platformLabels: Record<SocialPlatform, string> = {
    website: "Sitio Web",
    facebook: "Facebook",
    instagram: "Instagram",
};

export default function SocialLinksInput({ value = {}, onChange }: SocialLinksInputProps) {
    // Convertir el objeto value a array de links
    const [links, setLinks] = useState<SocialLink[]>(() => {
        return Object.entries(value).map(([platform, url], index) => ({
            id: `${platform}-${index}`,
            platform: platform as SocialPlatform,
            url,
        }));
    });

    const updateParent = (newLinks: SocialLink[]) => {
        const obj: Record<string, string> = {};
        newLinks.forEach((link) => {
            if (link.url.trim()) {
                obj[link.platform] = link.url.trim();
            }
        });
        onChange?.(obj);
    };

    const handleAddLink = () => {
        const newLink: SocialLink = {
            id: `link-${Date.now()}`,
            platform: "website",
            url: "",
        };
        const newLinks = [...links, newLink];
        setLinks(newLinks);
        updateParent(newLinks);
    };

    const handleRemoveLink = (id: string) => {
        const newLinks = links.filter((link) => link.id !== id);
        setLinks(newLinks);
        updateParent(newLinks);
    };

    const handlePlatformChange = (id: string, platform: SocialPlatform) => {
        const newLinks = links.map((link) =>
            link.id === id ? { ...link, platform } : link
        );
        setLinks(newLinks);
        updateParent(newLinks);
    };

    const handleUrlChange = (id: string, url: string) => {
        const newLinks = links.map((link) => {
            if (link.id === id) {
                // Validar URL con Zod
                let error: string | undefined = undefined;
                if (url.trim()) {
                    try {
                        const validation = socialLinksSchema.shape[link.platform].safeParse(url);
                        if (!validation.success) {
                            error = validation.error.issues[0]?.message || "URL inválida";
                        }
                    } catch (e) {
                        error = "URL inválida";
                    }
                }
                return { ...link, url, error };
            }
            return link;
        });
        setLinks(newLinks);
        updateParent(newLinks);
    };    // Plataformas ya usadas (para deshabilitar en select)
    const usedPlatforms = new Set(links.map((link) => link.platform));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm text-accent-foreground">Redes Sociales</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLink}
                    className="h-8 gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Agregar
                </Button>
            </div>

            {links.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No hay enlaces agregados. Haz clic en "Agregar" para añadir uno.
                </p>
            )}

            <div className="space-y-2">
                {links.map((link) => (
                    <div key={link.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Select
                                value={link.platform}
                                onValueChange={(val) => handlePlatformChange(link.id, val as SocialPlatform)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(platformLabels) as SocialPlatform[]).map((platform) => (
                                        <SelectItem
                                            key={platform}
                                            value={platform}
                                            disabled={usedPlatforms.has(platform) && link.platform !== platform}
                                        >
                                            {platformLabels[platform]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex-1">
                                <Input
                                    placeholder={`URL de ${platformLabels[link.platform]}`}
                                    value={link.url}
                                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                                    className={link.error ? "border-red-500" : ""}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLink(link.id)}
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {link.error && (
                            <p className="text-xs text-red-600 ml-[148px]">{link.error}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
