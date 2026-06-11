using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using GcmsSoc.API.Data;
using GcmsSoc.API.Models;

namespace GcmsSoc.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public class LoginRequest 
        { 
            public string Username { get; set; } = string.Empty; 
            public string Password { get; set; } = string.Empty; 
        }

        public class RegisterRequest 
        { 
            public string Username { get; set; } = string.Empty; 
            public string Password { get; set; } = string.Empty; 
            public string Sex { get; set; } = "Male";
            public int Age { get; set; }
            public string City { get; set; } = string.Empty;
        }

        public class StatusRequest { public string Status { get; set; } = string.Empty; }
        public class AvatarRequest { public string AvatarUrl { get; set; } = string.Empty; }
        public class BioRequest { public string Bio { get; set; } = string.Empty; }
        public class CoinsRequest { public int Amount { get; set; } }
        public class RatingRequest { public int Amount { get; set; } }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var username = request.Username.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username);
            if (user == null) return NotFound("User not found");

            // Verify password
            var hashedInput = HashPassword(request.Password);
            if (user.PasswordHash != hashedInput) return BadRequest("Incorrect password");

            user.IsOnline = true;
            user.CurrentAction = "შემოვიდა პორტალზე";
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var username = request.Username.Trim();
            if (string.IsNullOrEmpty(username)) return BadRequest("Username is required");
            if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 6)
                return BadRequest("Password must be at least 6 characters long");

            var exists = await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower());
            if (exists) return BadRequest("Username already exists");

            var newUser = new User
            {
                Id = Guid.NewGuid().ToString().Substring(0, 9),
                Username = username,
                PasswordHash = HashPassword(request.Password),
                Avatar = request.Sex == "Male" 
                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                Status = "გამარჯობა, მე ახალი ვარ! 👋",
                Coins = 100,
                Rating = 1,
                Sex = request.Sex,
                Age = request.Age,
                City = string.IsNullOrEmpty(request.City) ? "უცნობი ქალაქი" : request.City,
                RegDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Role = "user",
                IsOnline = true,
                CurrentAction = "შემოუერთდა GcmsSoc-ს",
                Bio = "ახლად დარეგისტრირებული მომხმარებელი."
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(newUser);
            return Ok(new { token, user = newUser });
        }

        [HttpPost("logout/{userId}")]
        [Authorize]
        public async Task<IActionResult> Logout(string userId)
        {
            var authenticatedUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (authenticatedUserId != userId) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.IsOnline = false;
                user.CurrentAction = "ხაზგარეშე";
                await _context.SaveChangesAsync();
            }
            return Ok();
        }

        [HttpPost("status/{userId}")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(string userId, [FromBody] StatusRequest request)
        {
            var authenticatedUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (authenticatedUserId != userId) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.Status = request.Status;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("avatar/{userId}")]
        [Authorize]
        public async Task<IActionResult> UpdateAvatar(string userId, [FromBody] AvatarRequest request)
        {
            var authenticatedUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (authenticatedUserId != userId) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.Avatar = request.AvatarUrl;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("bio/{userId}")]
        [Authorize]
        public async Task<IActionResult> UpdateBio(string userId, [FromBody] BioRequest request)
        {
            var authenticatedUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (authenticatedUserId != userId) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.Bio = request.Bio;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("gift/{recipientId}")]
        [Authorize]
        public async Task<IActionResult> GiveGift(string recipientId)
        {
            var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId)) return Unauthorized();

            if (senderId == recipientId) return BadRequest("თქვენს თავს საჩუქარს ვერ გაუგზავნით!");

            var sender = await _context.Users.FindAsync(senderId);
            var recipient = await _context.Users.FindAsync(recipientId);

            if (sender == null || recipient == null) return NotFound();

            if (sender.Coins < 10)
            {
                return BadRequest("საჩუქრის გასაგზავნად გჭირდებათ მინიმუმ 10 მონეტა!");
            }

            sender.Coins -= 10;
            recipient.Coins += 10;
            recipient.Rating += 1;

            await _context.SaveChangesAsync();

            return Ok(sender);
        }
    }
}
