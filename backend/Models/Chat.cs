using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class ChatRoom
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Description { get; set; } = string.Empty;

        public List<ChatMessage> Messages { get; set; } = new();
    }

    public class ChatMessage
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? ChatRoomId { get; set; } // Null for Guestbook

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Avatar { get; set; } = string.Empty;

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
