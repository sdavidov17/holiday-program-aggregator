import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface ProviderCardProps {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  location?: string;
  isVetted?: boolean;
  tags?: string[];
}

export default function ProviderCard({
  id,
  name,
  description,
  rating = 0,
  reviewCount = 0,
  imageUrl,
  location,
  isVetted,
  tags = []
}: ProviderCardProps) {
  return (
    <Link href={`/providers/${id}`}>
      <div className="card group cursor-pointer">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {imageUrl ? (
                <Image 
                  src={imageUrl} 
                  alt={name} 
                  width={64} 
                  height={64} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {name}
                </h3>
                {location && (
                  <p className="text-sm text-gray-500 mt-0.5">{location}</p>
                )}
              </div>
              {isVetted && (
                <span className="badge-success">
                  ✓ Vetted
                </span>
              )}
            </div>

            {description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {description}
              </p>
            )}

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'text-secondary-400 fill-secondary-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="badge-primary text-xs">
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}