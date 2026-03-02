// src/modules/seller/shipping/components/ShippingChannelCard.tsx
import React, { useState, memo, useCallback } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { ShippingChannel } from '../types';
import classNames from 'classnames';

interface Props {
  channel: ShippingChannel;
  onToggleChannel: (id: string, value: boolean) => void;
  onToggleService: (channelId: string, serviceId: string, value: boolean) => void;
}

const ShippingChannelCard: React.FC<Props> = ({ channel, onToggleChannel, onToggleService }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handlers
  const handleToggleMain = useCallback((val: boolean) => {
    onToggleChannel(channel.id, val);
  }, [channel.id, onToggleChannel]);

  const handleToggleSub = useCallback((serviceId: string, val: boolean) => {
    onToggleService(channel.id, serviceId, val);
  }, [channel.id, onToggleService]);

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-4">
      {/* Header Row */}
      <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-medium text-[#081F24]">{channel.name}</h3>
            {!channel.isEnabled && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">Đang tắt</span>
            )}
          </div>
          <p className="text-sm font-light text-gray-600">{channel.description}</p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          {/* Toggle Button for the whole channel */}
          <div className="flex items-center gap-2">
            <ToggleSwitch checked={channel.isEnabled} onChange={handleToggleMain} />
          </div>

          {/* Expand/Collapse Button */}
          {channel.services.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-600 text-sm transition-colors"
            >
              <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content (Sub-services) */}
      <div 
        className={classNames(
          "bg-gray-50/50 border-t border-gray-100 transition-all duration-300 ease-in-out origin-top",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        {channel.services.map((service) => (
          <div 
            key={service.id} 
            className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 pl-8 md:pl-10"
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-700">{service.name}</span>
              {service.isCodEnabled && (
                 <span className="text-[10px] bg-orange-100 text-[#E78720] px-1.5 py-0.5 rounded border border-orange-200 font-medium">
                   COD
                 </span>
              )}
            </div>
            
            <ToggleSwitch 
              checked={service.isEnabled} 
              // Chỉ cho phép bật service con nếu channel cha đang bật
              disabled={!channel.isEnabled} 
              onChange={(val) => handleToggleSub(service.id, val)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ShippingChannelCard);