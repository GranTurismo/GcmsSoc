using System;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Avatar { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Status { get; set; } = string.Empty;

        public int Coins { get; set; }

        public int Rating { get; set; }

        [Required]
        [MaxLength(10)]
        public string Sex { get; set; } = "Male";

        public int Age { get; set; }

        [Required]
        [MaxLength(50)]
        public string City { get; set; } = "თბილისი";

        [Required]
        [MaxLength(20)]
        public string RegDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "user"; // admin, moderator, user

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsOnline { get; set; }

        [MaxLength(200)]
        public string CurrentAction { get; set; } = "ხაზგარეშე";

        public string Bio { get; set; } = string.Empty;
    }
}
