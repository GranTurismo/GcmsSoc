using System;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class PrivateMessage
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [Required]
        public string SenderUsername { get; set; } = string.Empty;

        [Required]
        public string SenderAvatar { get; set; } = string.Empty;

        [Required]
        public string RecipientId { get; set; } = string.Empty;

        [Required]
        public string RecipientUsername { get; set; } = string.Empty;

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public string Date { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; }
    }
}
