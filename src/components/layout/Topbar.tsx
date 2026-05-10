'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { pointService } from "@/services/point.service";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/services/api";

// #24 + #41 (wiki 0044/0045/0046): Top header CMS.
// Đọc setting key 'topHeader' qua /content/config/topHeader. Admin có thể PATCH
// qua /content/admin/config với body { key: 'topHeader', value: {...} }.
// Fallback hardcode nếu setting chưa tạo (giữ behavior hiện tại).

interface TopHeaderConfig {
  hotline?: string;
  guestText?: string;
  links?: { label: string; href: string; icon?: 'help' | 'policy' | 'contact' }[];
}

const DEFAULT_CONFIG: Required<TopHeaderConfig> = {
  hotline: '19001221',
  guestText: 'Chào mừng đến với GMall',
  links: [
    { label: 'Trợ giúp', href: '/user/help', icon: 'help' },
    { label: 'Chính sách', href: '/privacy', icon: 'policy' },
    { label: 'Liên hệ', href: '/contact', icon: 'contact' },
  ],
};

const ICON_MAP = { help: QuestionMarkCircleIcon, policy: ShieldCheckIcon, contact: PhoneIcon };

const TopBar = () => {
  const { isAuthenticated, user, updatePoint } = useUserStore();
  const displayPoints = user?.point || 0;
  const [config, setConfig] = useState<Required<TopHeaderConfig>>(DEFAULT_CONFIG);

  // Fetch CMS config 1 lần on mount
  useEffect(() => {
    api.get<any>('/content/config/topHeader')
      .then((res) => {
        if (res && typeof res === 'object') {
          setConfig({
            hotline: res.hotline || DEFAULT_CONFIG.hotline,
            guestText: res.guestText || DEFAULT_CONFIG.guestText,
            links: Array.isArray(res.links) && res.links.length > 0 ? res.links : DEFAULT_CONFIG.links,
          });
        }
      })
      .catch(() => {/* fallback default */});
  }, []);

  useEffect(() => {
    const fetchPoints = async () => {
      if (isAuthenticated) {
        try {
          const data: any = await pointService.getMyPoints();
          if (data && typeof data.points === 'number') {
             updatePoint(data.points);
          }
        } catch (error) {
          console.error("Failed to fetch points:", error);
        }
      }
    };
    fetchPoints();
  }, [isAuthenticated, updatePoint]);

  return (
    <div className="w-full bg-[#F2F2F2] h-11 hidden md:flex items-center justify-center border-b border-gray-200 z-50 relative">
      <div className="w-full max-w-[1340px] px-4 flex justify-between items-center h-full text-[15px] font-roboto font-normal text-gray-500">

        {/* Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300">
            <span className="text-gray-500">Hotline:</span>
            <a href={`tel:${config.hotline}`} className="text-[#960D76] font-medium hover:underline">
              {config.hotline}
            </a>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span>Điểm thưởng của bạn:</span>
              <span className="text-brand-orange font-bold">
                {displayPoints.toLocaleString()} Xu
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <span>{config.guestText}</span>
            </div>
          )}
        </div>

        {/* Right Side: Links từ CMS */}
        <div className="flex items-center gap-6">
          {config.links.map((link, i) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div className="h-4 w-px bg-gray-300"></div>}
                {i === 0 && <div className="h-4 w-px bg-gray-300"></div>}
                <Link href={link.href} className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;